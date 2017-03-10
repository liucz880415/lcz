package cn.lcz.kafka.meta;


import cn.lcz.core.annotation.Key;
import cn.lcz.core.annotation.RedisExpire;

import java.io.Serializable;

/**
 * 当消息体大于512KB的时候，不直接发送消息，而是先将消息体存放到Redis中，消息中把Redis对应的ID存放起来。
 */
@RedisExpire
public class KafkaCachePayload implements Serializable {
    @Key
    private String messageId;
    private String payload;

    public KafkaCachePayload() {

    }

    public KafkaCachePayload(String messageId, String payload) {
        this.messageId = messageId;
        this.payload = payload;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }
}
