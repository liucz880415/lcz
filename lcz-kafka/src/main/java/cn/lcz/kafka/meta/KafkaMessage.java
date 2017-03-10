package cn.lcz.kafka.meta;

import cn.lcz.core.utils.UUIDTools;
import cn.lcz.kafka.core.KafkaTag;

import java.util.Date;
import java.util.Set;

public final class KafkaMessage {
    // Message ID. 当使用缓存重试时，如果某条message已经被缓存过，且重试次数相同，则不再进行缓存。
    private String messageId = UUIDTools.getUUID();
    private Set<KafkaTag> tags;
    // 如果isCached为true，则此处存储的Redis缓存的ID；否则，这里存储消息体的内容。
    private String payload;
    // 当isCache为true时，此处存储payload在Redis中对应的ID。
    private String payloadId;
    // 是否缓存。当Kafka消息的大小超过512KB时（Kafka消息默认限制最大为1MB），消息体会被存放在Redis中，所有的Consumer在处理消息的时候从Redis中取出。
    private Boolean isCached = false;

    // 重试次数，下次重试间隔为：(1<<retry)分钟。初始化时，间隔8分钟执行第一次重试。
    private Integer retry;
    private Date lastProcess;

    public KafkaMessage() {

    }

    public KafkaMessage(Set<KafkaTag> tags, String payload) {
        this.tags = tags;
        this.payload = payload;
    }

    public Set<KafkaTag> getTags() {
        return tags;
    }

    public void setTags(Set<KafkaTag> tags) {
        this.tags = tags;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public Integer getRetry() {
        return retry;
    }

    public void setRetry(Integer retry) {
        this.retry = retry;
    }

    public Date getLastProcess() {
        return lastProcess;
    }

    public void setLastProcess(Date lastProcess) {
        this.lastProcess = lastProcess;
    }

    public Boolean getIsCached() {
        return isCached;
    }

    public void setIsCached(Boolean isCached) {
        this.isCached = isCached;
    }

    public String getPayloadId() {
        return payloadId;
    }

    public void setPayloadId(String payloadId) {
        this.payloadId = payloadId;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }
}
