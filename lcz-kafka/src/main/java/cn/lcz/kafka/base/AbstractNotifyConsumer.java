package cn.lcz.kafka.base;

import cn.lcz.config.kafka.beans.KafkaConfig;
import cn.lcz.config.kafka.beans.KafkaConsumerConfig;
import cn.lcz.core.utils.RedisUtil;
import cn.lcz.kafka.annotation.ConsumerResourceLimit;
import cn.lcz.kafka.api.KafkaFactory;
import cn.lcz.kafka.core.NotifyTopic;
import cn.lcz.kafka.meta.KafkaCacheMessage;
import cn.lcz.kafka.meta.KafkaCachePayload;
import cn.lcz.kafka.meta.KafkaMessage;
import cn.lcz.kafka.util.KafkaUtils;
import com.alibaba.fastjson.JSON;
import com.google.common.base.Throwables;
import com.google.common.collect.Lists;
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
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public abstract class AbstractNotifyConsumer<T> {
    private static final Logger logger = LoggerFactory.getLogger(AbstractNotifyConsumer.class);

    private final NotifyTopic topic;
    private final List<KafkaNotifyListener<T>> listeners;
    private final ThreadPoolExecutor executorService;
    // Consumer是否已经启动。
    private boolean stopped = false;

    private Consumer<String, KafkaMessage> consumer;

    @Autowired
    private KafkaConfig kafkaConfig;

    @Autowired
    private KafkaConsumerConfig kafkaConsumerConfig;

    @Autowired
    private RedisUtil redisUtil;

    private static final ExecutorService consumerExecutors = new ThreadPoolExecutor(0, Integer.MAX_VALUE, 0, TimeUnit.SECONDS, new SynchronousQueue<>());

    protected AbstractNotifyConsumer(final NotifyTopic topic) {
        this.topic = topic;
        this.listeners = getListeners();
        int thread = getThreadCount();
        executorService = new ThreadPoolExecutor(thread, thread, 120L, TimeUnit.SECONDS, new LinkedBlockingQueue<>());
        executorService.allowCoreThreadTimeOut(true);
    }

    private int getThreadCount() {
        ConsumerResourceLimit limit = this.getClass().getAnnotation(ConsumerResourceLimit.class);
        return limit != null ? limit.thread() : 20;
    }

    protected abstract List<KafkaNotifyListener<T>> getListeners();

    @PostConstruct
    void startConsumer() {
        // 创建消费者。
        Properties properties = kafkaConsumerConfig.getDefaultConsumerProperties();
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, topic.getNotifyConsumer(kafkaConfig.getSuffix()));
        consumer = KafkaFactory.createConsumer(properties);

        consumer.subscribe(Lists.newArrayList(topic.getTopicName(kafkaConfig.getSuffix())));

        logger.info("Consumer {} subscribing topic {} starting..", properties.get(ConsumerConfig.GROUP_ID_CONFIG), topic.getTopicName(kafkaConfig.getSuffix()));

        // 启动线程监听Consumer消息。
        consumerExecutors.execute(new KafkaConsumerExecutor());
    }

    @PreDestroy
    void stopConsumer() {
        stopped = true;
        consumer.wakeup();
    }

    class KafkaConsumerExecutor implements Runnable {
        @Override
        public void run() {
            try {
                while (!stopped) {
                    try {
                        runInternal();
                    } catch (Throwable e) {
                        logger.error("Consumer executor error: {} - {}, will try again in 30 seconds.", e.getClass().getSimpleName(), e.getMessage());
                        sleep(30000);
                    }
                }
            } catch (WakeupException e) {
                // Ignore exception if closing
                if (!stopped) throw e;
            } finally {
                logger.info("Closing consumer: {}", topic.getNotifyConsumer(kafkaConfig.getSuffix()));
                consumer.close();
            }
        }

        private void runInternal() {
            ConsumerRecords<String, KafkaMessage> records = consumer.poll(60 * 1000);
            if (records == null || records.isEmpty()) {
                // If no records are retrieved in the last minute, do nothing.
                return;
            }

            logger.debug("ConsumerRecords received, count: {}.", records.count());

            Integer threshold = records.count() > 100 ? records.count() : 100;
            if (executorService.getQueue().size() > threshold) {
                logger.warn("[{}]{} records waiting for processing, sleep for 20 seconds.", topic, executorService.getQueue().size());
                sleep(20000);
            }
            if (executorService.getQueue().size() > threshold) {
                return;
            }

            for (ConsumerRecord<String, KafkaMessage> record : records) {
                String cacheId = cacheMessageForRedo(record.topic(), record.value());
                executorService.execute(new KafkaTaskExecutor(record, listeners, cacheId));
            }
            consumer.commitSync();
        }

        private void sleep(long ms) {
            try {
                Thread.sleep(ms);
            } catch (InterruptedException e) {
                logger.error("Sleep error: {}.", e.getMessage());
            }
        }
    }

    class KafkaTaskExecutor implements Runnable {
        private final ConsumerRecord<String, KafkaMessage> record;
        private final List<KafkaNotifyListener<T>> listeners;
        private final String cacheId;

        KafkaTaskExecutor(ConsumerRecord<String, KafkaMessage> record, List<KafkaNotifyListener<T>> listeners, String cacheId) {
            this.record = record;
            this.listeners = listeners;
            this.cacheId = cacheId;
        }

        @Override
        public void run() {
            KafkaMessage message = record.value();
            logger.debug("Processing, id: {}, payload: {}.", record.key(), message.getPayload());

            // 如果消息体缓存在Redis中，从Redis中取出。
            if (message.getIsCached() != null && message.getIsCached()) {
                KafkaCachePayload payload = redisUtil.hgetx(KafkaCachePayload.class, message.getPayloadId());
                message.setPayload(payload.getPayload());
            }

            List<KafkaListener> failedListeners = Lists.newArrayList();
            listeners.stream().parallel().forEach(listener -> {
                try {
                    listener.onMessage(message);
                } catch (Throwable e) {
                    logger.error("Message processing error: {}.", e.getMessage());
                    failedListeners.add(listener);
                    AbstractNotifyConsumer.this.collectAndReportException(e, record);
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

        String cacheId = message.getMessageId() + ":" + this.topic.getNotifyConsumer(kafkaConfig.getSuffix());
        KafkaCacheMessage cacheMessage = new KafkaCacheMessage(cacheId, topic, message);
        redisUtil.hset(cacheMessage);

        return cacheId;
    }

    private void collectAndReportException(Throwable e, ConsumerRecord<String, KafkaMessage> record) {
        System.out.println("collectAndReportException  error : " + JSON.toJSONString(record));
    }
}
