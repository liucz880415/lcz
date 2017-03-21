package cn.lcz.kafka.base;

import cn.lcz.config.kafka.beans.KafkaConfig;
import cn.lcz.config.kafka.beans.KafkaProducerConfig;
import cn.lcz.core.utils.RedisUtil;
import cn.lcz.kafka.api.KafkaFactory;
import cn.lcz.kafka.core.Topic;
import cn.lcz.kafka.meta.KafkaCachePayload;
import cn.lcz.kafka.meta.KafkaMessage;
import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import javax.annotation.PostConstruct;
import java.util.Properties;
import java.util.UUID;

public abstract class AbstractProducer {
    private static final Logger logger = LoggerFactory.getLogger(AbstractProducer.class);

    private final Topic topic;
    private Producer<String, KafkaMessage> producer;

    @Autowired
    private KafkaConfig kafkaConfig;

    @Autowired
    private KafkaProducerConfig kafkaProducerConfig;

    @Autowired
    private RedisUtil redisUtil;

    protected AbstractProducer(final Topic topic) {
        this.topic = topic;
    }

    @PostConstruct
    private void createProducer() {
        Properties properties = kafkaProducerConfig.getDefaultProducerProperties();
        producer = KafkaFactory.createProducer(properties);
    }

    /**
     * 如果当前消息发送线程处于事务中，则在该事务结束之后再发送消息。
     *
     * @param message 要发送的消息
     * @return 已发送消息的messageId
     */
    protected String sendAfterTransactionCommit(final KafkaMessage message) {
        String messageId = UUID.randomUUID().toString();
        String topicStr = topic.getTopicName(kafkaConfig.getSuffix());

        if (message.getPayload().length() > 512 * 1024) {
            KafkaCachePayload payload = new KafkaCachePayload(messageId, message.getPayload());
            // The default timeout would be 1 hour. When exception is thrown, this timeout should be larger.
            redisUtil.hsetx(payload, 3600);
            message.setPayloadId(messageId);
            // Do not send the body in message.
            message.setPayload(null);
            message.setIsCached(true);
        }

        ProducerRecord<String, KafkaMessage> record = new ProducerRecord<>(topicStr, messageId, message);

        logger.debug("Process message out of transaction.");
        producer.send(record);

        return record.key();
    }
}
