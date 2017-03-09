package cn.lcz.kafka.api.impl;

import cn.lcz.kafka.api.KafkaFactoryApi;
import cn.lcz.kafka.meta.KafkaMessage;
import com.google.common.base.Strings;
import com.google.common.collect.Maps;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.Producer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.Properties;

public class KafkaFactoryImpl implements KafkaFactoryApi {
    private static final Logger logger = LoggerFactory.getLogger(KafkaFactoryImpl.class);

    // client.id -> producer, 同一个应用使用同一个producer即可。
    private static Producer<String, KafkaMessage> producer = null;
    // group.id -> consumer，不同的模块使用不同的consumer。
    private static final Map<String, Consumer<String, KafkaMessage>> consumerMap = Maps.newHashMap();

    @Override
    synchronized public Producer<String, KafkaMessage> createProducer(Properties properties) {
        if (producer != null) {
            return producer;
        }

        producer = new KafkaProducer<>(properties);
        return producer;
    }

    @Override
    synchronized public Consumer<String, KafkaMessage> createConsumer(Properties properties) {
        // 创建Consumer，不同的Consumer使用不同的groupId区分。
        String groupId = properties.getProperty(ConsumerConfig.GROUP_ID_CONFIG);
        if (Strings.isNullOrEmpty(groupId)) {
            throw new RuntimeException("group.id property must be specified.");
        }

        logger.debug("Creating kafka consumer with group.id = {}.", groupId);

        if (consumerMap.containsKey(groupId)) {
            throw new RuntimeException("Consumer with group id = " + groupId + " already created.");
        }

        Consumer<String, KafkaMessage> consumer = new KafkaConsumer<>(properties);
        consumerMap.put(groupId, consumer);
        return consumer;
    }
}
