package cn.lcz.config.email.parser;

import cn.lcz.config.email.beans.SmtpConfig;
import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.xml.AbstractSimpleBeanDefinitionParser;
import org.springframework.beans.factory.xml.ParserContext;
import org.w3c.dom.Element;

public class SmtpConfigParser extends AbstractSimpleBeanDefinitionParser {
    @Override
    protected void doParse(Element element, ParserContext parserContext, BeanDefinitionBuilder builder) {
        super.doParse(element, parserContext, builder);

        builder.addPropertyValue("needAuth", element.getAttribute("need-auth"));
        builder.addPropertyValue("useSsl", element.getAttribute("use-ssl"));
        builder.addPropertyValue("startTls", element.getAttribute("start-tls"));
        builder.addPropertyValue("host", element.getAttribute("host"));
        builder.addPropertyValue("port", element.getAttribute("port"));
        builder.addPropertyValue("connectionTimeout", element.getAttribute("connection-timeout"));
        builder.addPropertyValue("timeout", element.getAttribute("timeout"));
        builder.addPropertyValue("username", element.getAttribute("username"));
        builder.addPropertyValue("password", element.getAttribute("password"));
        builder.addPropertyValue("mailFrom", element.getAttribute("mail-from"));
        builder.addPropertyValue("mailFromName", element.getAttribute("mail-from-name"));
    }

    @Override
    protected Class<SmtpConfig> getBeanClass(Element element) {
        return SmtpConfig.class;
    }
}
