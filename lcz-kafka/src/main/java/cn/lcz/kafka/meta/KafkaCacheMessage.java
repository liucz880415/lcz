package cn.lcz.kafka.meta;



import cn.lcz.meta.annotation.Key;

import java.io.Serializable;

public class KafkaCacheMessage implements Serializable {
    @Key
    private String cacheId;
    private String topic;
    private KafkaMessage kafkaMessage;

    KafkaCacheMessage() {
    }

    public KafkaCacheMessage(String cacheId, String topic, KafkaMessage kafkaMessage) {
        this.cacheId = cacheId;
        this.topic = topic;
        this.kafkaMessage = kafkaMessage;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public KafkaMessage getKafkaMessage() {
        return kafkaMessage;
    }

    public void setKafkaMessage(KafkaMessage message) {
        this.kafkaMessage = message;
    }

    public String getCacheId() {
        return cacheId;
    }

    public void setCacheId(String cacheId) {
        this.cacheId = cacheId;
    }
}
