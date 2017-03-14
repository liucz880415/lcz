package cn.lcz.kafka.core;

public enum NotifyTopic implements Topic {
    TEST_DEMO("测试kafka消息");

    private static final String CONSUMER_PREFIX = "CID_NOTIFY";
    private static final String TOPIC_PREFIX = "TID_NOTIFY";
    private static final String SEPARATOR = "_";

    private final String description;

    NotifyTopic(String description) {
        this.description = description;
    }

    @Override
    public String getTopicName(String suffix) {
        return TOPIC_PREFIX + SEPARATOR + this.toString() + SEPARATOR + suffix;
    }

    public String getNotifyConsumer(String suffix) {
        return CONSUMER_PREFIX + SEPARATOR + this.toString() + SEPARATOR + suffix;
    }

    public String getDescription() {
        return description;
    }
}
