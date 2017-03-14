package cn.lcz.kafka.core;

public enum UpdateTopic implements Topic {
    TEST_UPDATE_KAFKA("测试update消息");

    private static final String PREFIX = "TID_UPDATE";
    private static final String SEPARATOR = "_";

    private final String description;

    UpdateTopic(String description) {
        this.description = description;
    }

    @Override
    public String getTopicName(String suffix) {
        return PREFIX + SEPARATOR + this.toString() + SEPARATOR + suffix;
    }

    public String getDescription() {
        return description;
    }
}
