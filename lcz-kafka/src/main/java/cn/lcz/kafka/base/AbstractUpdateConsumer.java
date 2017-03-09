package cn.lcz.kafka.base;

import cn.lcz.config.kafka.beans.KafkaConfig;
import cn.lcz.config.kafka.beans.KafkaConsumerConfig;
import cn.lcz.core.utils.RedisUtil;
import cn.lcz.kafka.annotation.ConsumerResourceLimit;
import cn.lcz.kafka.api.KafkaFactory;
import cn.lcz.kafka.core.UpdateConsumer;
import cn.lcz.kafka.core.UpdateTopic;
import cn.lcz.kafka.meta.KafkaCacheMessage;
import cn.lcz.kafka.meta.KafkaCachePayload;
import cn.lcz.kafka.meta.KafkaMessage;
import cn.lcz.kafka.util.KafkaUtils;
import com.alibaba.fastjson.JSON;
import com.google.common.base.Throwables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.errors.WakeupException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public abstract class AbstractUpdateConsumer {
    private static final Logger logger = LoggerFactory.getLogger(AbstractUpdateConsumer.class);

    private final UpdateConsumer updateConsumer;
    private final Map<UpdateTopic, List<KafkaUpdateListener>> listeners;
    /**
     * 启动一个带缓冲功能的线程池，启动时按需分配线程，最多分配20个线程，120秒不活跃的线程将被回收。当线程池内多余20个线程时，阻塞执行。
     */
    private final ThreadPoolExecutor executorService;

    private Consumer<String, KafkaMessage> kafkaMessageConsumer;
    private boolean stopped = false;

    @Autowired
    private KafkaConfig kafkaConfig;

    @Autowired
    private KafkaConsumerConfig kafkaConsumerConfig;

    @Autowired
    private RedisUtil redisUtil;

    private static final Map<String, UpdateTopic> topicReverseMap = Maps.newHashMap();

    private static final ExecutorService consumerExecutors =
            new ThreadPoolExecutor(0, Integer.MAX_VALUE, 0, TimeUnit.SECONDS, new SynchronousQueue<>());

    protected AbstractUpdateConsumer(final UpdateConsumer updateConsumer) {
        this.updateConsumer = updateConsumer;
        this.listeners = getListeners();
        int thread = getThreadCount();
        executorService = new ThreadPoolExecutor(thread, thread, 120L, TimeUnit.SECONDS, new LinkedBlockingQueue<>());
        executorService.allowCoreThreadTimeOut(true);
    }

    private int getThreadCount() {
        ConsumerResourceLimit limit = this.getClass().getAnnotation(ConsumerResourceLimit.class);
        return limit != null ? limit.thread() : 20;
    }

    protected abstract Map<UpdateTopic, List<KafkaUpdateListener>> getListeners();

    @PostConstruct
    void startConsumer() {
        // 创建消费者。
        Properties properties = kafkaConsumerConfig.getDefaultConsumerProperties();
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, updateConsumer.getConsumerName(kafkaConfig.getSuffix()));
        kafkaMessageConsumer = KafkaFactory.createConsumer(properties);

        List<String> topics = listeners.keySet().stream().map(topic -> {
            topicReverseMap.put(topic.getTopicName(kafkaConfig.getSuffix()), topic);
            return topic.getTopicName(kafkaConfig.getSuffix());
        }).collect(Collectors.toList());

        kafkaMessageConsumer.subscribe(topics);

        logger.info("Consumer {} subscribing topics {} starting..", properties.get(ConsumerConfig.GROUP_ID_CONFIG), topics);

        // 启动线程监听Consumer消息。
        consumerExecutors.execute(new KafkaConsumerExecutor());
    }

    @PreDestroy
    void stopConsumer() {
        stopped = true;
        kafkaMessageConsumer.wakeup();
    }

    class KafkaConsumerExecutor implements Runnable {
        @Override
        public void run() {
            try {
                while (!stopped) {
                    try {
                        runInternal();
                    } catch (Throwable e) {
                        logger.error("Consumer executor error: {} - {}, will try again.", e.getClass().getSimpleName(), e.getMessage());
                    }
                }
            } catch (WakeupException e) {
                // Ignore exception if closing
                if (!stopped) throw e;
            } finally {
                logger.info("Closing kafkaMessageConsumer: {}", updateConsumer.getConsumerName(kafkaConfig.getSuffix()));
                kafkaMessageConsumer.close();
            }
        }

        private void runInternal() {
            ConsumerRecords<String, KafkaMessage> records = kafkaMessageConsumer.poll(60 * 1000);
            if (records == null || records.isEmpty()) {
                // If no records are retrieved in the last minute, do nothing.
                return;
            }

            Integer threshold = records.count() > 100 ? records.count() : 100;
            if (executorService.getQueue().size() > threshold) {
                logger.warn("[{}]{} records waiting for processing, sleep for 20 seconds.", updateConsumer, executorService.getQueue().size());
                try {
                    Thread.sleep(20000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            if (executorService.getQueue().size() > threshold) {
                return;
            }

            logger.debug("ConsumerRecords received, count: {}.", records.count());

            for (ConsumerRecord<String, KafkaMessage> record : records) {
                if (record == null || record.topic() == null) {
                    logger.warn("Processing empty data, maybe this is an error.");
                    continue;
                }
                UpdateTopic topic = topicReverseMap.get(record.topic());
                if (listeners.get(topic) == null || listeners.get(topic).isEmpty()) {
                    logger.debug("No listener specified for topic: {}", topic.toString());
                    continue;
                }
                List<KafkaListener> topicListeners = Lists.newArrayList();
                listeners.get(topic).stream().forEach(topicListeners::add);
                String cacheId = cacheMessageForRedo(record.topic(), record.value());
                executorService.execute(new KafkaTaskExecutor(record, topicListeners, cacheId));
            }

            kafkaMessageConsumer.commitSync();
        }
    }

    class KafkaTaskExecutor implements Runnable {
        private final ConsumerRecord<String, KafkaMessage> record;
        private final List<KafkaListener> listeners;
        private final String cacheId;

        KafkaTaskExecutor(ConsumerRecord<String, KafkaMessage> record, List<KafkaListener> listeners, String cacheId) {
            this.record = record;
            this.listeners = listeners;
            this.cacheId = cacheId;
        }

        @Override
        public void run() {
            KafkaMessage message = record.value();
            logger.debug("Processing, id: {}, payload: {}.", record.key(), message.getPayload());
            if (message.getTags() == null) {
                logger.error("Message doesn't contain any tags. This should never happen! Skipping..");
                return;
            }

            // 如果消息体缓存在Redis中，从Redis中取出。
            if (message.getIsCached() != null && message.getIsCached()) {
                KafkaCachePayload payload = redisUtil.hgetx(KafkaCachePayload.class, message.getPayloadId());
                message.setPayload(payload.getPayload());
            }

            // 用于判断是否有Listener失败。
            List<KafkaListener> failedListeners = Lists.newArrayList();
            listeners.stream().parallel().forEach(listener -> {
                try {
                    listener.onMessage(message);
                } catch (Throwable e) {
                    logger.error("Message processing error: {}.", e.getMessage());
                    failedListeners.add(listener);
                    collectAndReportException(e, record);
                }
            });

            // 如果消息处理成功，则清空消息缓存。若消息缓存不清空，则会执行重试操作。
            if (failedListeners.isEmpty()) {
                redisUtil.hdel(KafkaCacheMessage.class, cacheId);
            } else {
                logger.error("Kafka message processing failed, failed listeners: {}, failed messageId: {}.", failedListeners.size(), cacheId);
            }
        }
    }

    private String cacheMessageForRedo(String topic, KafkaMessage message) {
        // 发送消息之前，在Redis中缓存整个消息，用于以后重试。
        message.setLastProcess(new Date());
        message.setRetry(message.getRetry() == null ? 1 : message.getRetry() + 1);
        // 如果使用了缓存，则重置payload内容为空。
        if (message.getIsCached()) {
            message.setPayload(null);
            // 延长缓存时间。
            if (message.getPayloadId() == null) {
                logger.error("Payload ID is not provided.");
            } else {
                KafkaCachePayload cachePayload = redisUtil.hgetx(KafkaCachePayload.class, message.getPayloadId());
                redisUtil.hsetx(cachePayload, 3600 + KafkaUtils.getRetryInternal(message.getRetry()));
            }
        }

        String cacheId = message.getMessageId() + ":" + updateConsumer.getConsumerName(kafkaConfig.getSuffix());
        KafkaCacheMessage cacheMessage = new KafkaCacheMessage(cacheId, topic, message);
        redisUtil.hset(cacheMessage);

        return cacheId;
    }

    private void collectAndReportException(Throwable e, ConsumerRecord<String, KafkaMessage> record) {
        System.out.println("collectAndReportException  error : " + JSON.toJSONString(record));

    }
}
