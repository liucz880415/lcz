package cn.lcz.config.kafka.parser;

import cn.lcz.config.kafka.beans.KafkaProducerConfig;
import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.xml.AbstractSimpleBeanDefinitionParser;
import org.springframework.beans.factory.xml.ParserContext;
import org.w3c.dom.Element;

public class KafkaProducerParser extends AbstractSimpleBeanDefinitionParser {
    @Override
    protected void doParse(Element element, ParserContext parserContext, BeanDefinitionBuilder builder) {
        super.doParse(element, parserContext, builder);

        builder.addPropertyValue("bootstrapServers", element.getAttribute("bootstrap-servers"));
        builder.addPropertyValue("sessionTimeout", element.getAttribute("session-timeout"));
        builder.addPropertyValue("keySerializer", element.getAttribute("key-serializer"));
        builder.addPropertyValue("valueSerializer", element.getAttribute("value-serializer"));
    }

    @Override
    protected Class<KafkaProducerConfig> getBeanClass(Element element) {
        return KafkaProducerConfig.class;
    }
}
