package cn.lcz.config.redis.parser;

import cn.lcz.config.redis.beans.RedisConfig;
import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.xml.AbstractSimpleBeanDefinitionParser;
import org.springframework.beans.factory.xml.ParserContext;
import org.w3c.dom.Element;

public class RedisConfigParser extends AbstractSimpleBeanDefinitionParser {
    @Override
    protected void doParse(Element element, ParserContext parserContext, BeanDefinitionBuilder builder) {
        super.doParse(element, parserContext, builder);

        builder.addPropertyValue("address", element.getAttribute("address"));
        builder.addPropertyValue("port", element.getAttribute("port"));
        builder.addPropertyValue("auth", element.getAttribute("auth"));
        builder.addPropertyValue("database", element.getAttribute("database"));

        builder.addPropertyValue("maxTotal", element.getAttribute("max-total"));
        builder.addPropertyValue("maxIdle", element.getAttribute("max-idle"));
        builder.addPropertyValue("minIdle", element.getAttribute("min-idle"));
        builder.addPropertyValue("maxWaitMillis", element.getAttribute("max-wait-millis"));

        builder.addPropertyValue("testOnBorrow", element.getAttribute("test-on-borrow"));
        builder.addPropertyValue("testOnReturn", element.getAttribute("test-on-return"));
        builder.addPropertyValue("testWhileIdle", element.getAttribute("test-while-idle"));
        builder.addPropertyValue("timeBetweenEvictionRunsMillis", element.getAttribute("time-between-eviction-runs-millis"));
        builder.addPropertyValue("numTestsPerEvictionRun", element.getAttribute("num-tests-per-eviction-run"));
        builder.addPropertyValue("minEvictableIdleTimeMillis", element.getAttribute("min-evictable-idle-time-millis"));
        builder.addPropertyValue("timeout", element.getAttribute("timeout"));
    }

    @Override
    protected Class<RedisConfig> getBeanClass(Element element) {
        return RedisConfig.class;
    }
}
