package cn.lcz.kafka.api;

import cn.lcz.kafka.meta.KafkaMessage;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.producer.Producer;

import java.util.Properties;

public interface KafkaFactoryApi {
    /**
     * 创建Producer，Producer应该是单例的，以提高效率
     *
     * @param properties
     * @return Producer
     * @See https://kafka.apache.org/090/javadoc/index.html?org/apache/kafka/clients/producer/KafkaProducer.html
     * The producer is thread safe and sharing a single producer instance across threads will generally be faster than having multiple instances.
     */
    Producer<String, KafkaMessage> createProducer(final Properties properties);

    /**
     * 创建Consumer，需要提供的参数为：topic，groupId等。
     *
     * @param properties
     * @return Consumer
     */
    Consumer<String, KafkaMessage> createConsumer(final Properties properties);
}
