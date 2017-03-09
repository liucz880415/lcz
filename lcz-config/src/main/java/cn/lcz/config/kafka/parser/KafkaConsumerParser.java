package cn.lcz.config.kafka.parser;

import cn.lcz.config.kafka.beans.KafkaConsumerConfig;
import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.xml.AbstractSimpleBeanDefinitionParser;
import org.springframework.beans.factory.xml.ParserContext;
import org.w3c.dom.Element;

public class KafkaConsumerParser extends AbstractSimpleBeanDefinitionParser {
    @Override
    protected void doParse(Element element, ParserContext parserContext, BeanDefinitionBuilder builder) {
        super.doParse(element, parserContext, builder);

        builder.addPropertyValue("bootstrapServers", element.getAttribute("bootstrap-servers"));
        builder.addPropertyValue("sessionTimeout", element.getAttribute("session-timeout"));
        builder.addPropertyValue("keyDeserializer", element.getAttribute("key-deserializer"));
        builder.addPropertyValue("valueDeserializer", element.getAttribute("value-deserializer"));
    }

    @Override
    protected Class<KafkaConsumerConfig> getBeanClass(Element element) {
        return KafkaConsumerConfig.class;
    }
}
