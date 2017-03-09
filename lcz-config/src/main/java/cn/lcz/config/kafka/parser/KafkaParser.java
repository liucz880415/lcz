package cn.lcz.config.kafka.parser;

import cn.lcz.config.kafka.beans.KafkaConfig;
import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.xml.AbstractSimpleBeanDefinitionParser;
import org.springframework.beans.factory.xml.ParserContext;
import org.w3c.dom.Element;

public class KafkaParser extends AbstractSimpleBeanDefinitionParser {
    @Override
    protected void doParse(Element element, ParserContext parserContext, BeanDefinitionBuilder builder) {
        super.doParse(element, parserContext, builder);

        builder.addPropertyValue("suffix", element.getAttribute("suffix"));
    }

    @Override
    protected Class<KafkaConfig> getBeanClass(Element element) {
        return KafkaConfig.class;
    }
}
