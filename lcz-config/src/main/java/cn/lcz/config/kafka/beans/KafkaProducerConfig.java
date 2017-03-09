package cn.lcz.config.kafka.beans;

import java.util.Properties;

public class KafkaProducerConfig {
    private String bootstrapServers;

    private Integer sessionTimeout;

    private String keySerializer;

    private String valueSerializer;

    public Properties getDefaultProducerProperties() {
        Properties properties = new Properties();

        properties.put("bootstrap.servers", bootstrapServers);
        properties.put("session.timeout.ms", sessionTimeout);
        properties.put("key.serializer", keySerializer);
        properties.put("value.serializer", valueSerializer);

        return properties;
    }

    public String getBootstrapServers() {
        return bootstrapServers;
    }

    public void setBootstrapServers(String bootstrapServers) {
        this.bootstrapServers = bootstrapServers;
    }

    public Integer getSessionTimeout() {
        return sessionTimeout;
    }

    public void setSessionTimeout(Integer sessionTimeout) {
        this.sessionTimeout = sessionTimeout;
    }

    public String getKeySerializer() {
        return keySerializer;
    }

    public void setKeySerializer(String keySerializer) {
        this.keySerializer = keySerializer;
    }

    public String getValueSerializer() {
        return valueSerializer;
    }

    public void setValueSerializer(String valueSerializer) {
        this.valueSerializer = valueSerializer;
    }
}
