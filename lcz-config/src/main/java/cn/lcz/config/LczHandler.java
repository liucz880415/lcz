package cn.lcz.config;

import cn.lcz.config.email.parser.SmtpConfigParser;
import cn.lcz.config.kafka.parser.KafkaConsumerParser;
import cn.lcz.config.kafka.parser.KafkaParser;
import cn.lcz.config.kafka.parser.KafkaProducerParser;
import cn.lcz.config.redis.parser.RedisConfigParser;
import org.springframework.beans.factory.xml.NamespaceHandlerSupport;

public class LczHandler extends NamespaceHandlerSupport {
    @Override
    public void init() {
        // Handlers for kafka configuration.
        registerBeanDefinitionParser("kafka", new KafkaParser());
        registerBeanDefinitionParser("kafka-consumer", new KafkaConsumerParser());
        registerBeanDefinitionParser("kafka-producer", new KafkaProducerParser());

        // Handlers for redis configuration.
        registerBeanDefinitionParser("redis", new RedisConfigParser());

        // Handlers for SMTP configuration.
        registerBeanDefinitionParser("smtp", new SmtpConfigParser());

    }
}
