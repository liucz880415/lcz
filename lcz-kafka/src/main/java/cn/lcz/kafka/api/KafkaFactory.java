package cn.lcz.kafka.api;

import cn.lcz.kafka.api.impl.KafkaFactoryImpl;
import cn.lcz.kafka.meta.KafkaMessage;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.producer.Producer;

import java.util.Properties;

public class KafkaFactory {
    private static KafkaFactoryApi kafkaFactoryApi;

    static {
        kafkaFactoryApi = new KafkaFactoryImpl();
    }

    public static Producer<String, KafkaMessage> createProducer(final Properties properties) {
        return kafkaFactoryApi.createProducer(properties);
    }

    public static Consumer<String, KafkaMessage> createConsumer(final Properties properties) {
        return kafkaFactoryApi.createConsumer(properties);
    }
}
