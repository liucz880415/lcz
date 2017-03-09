package cn.lcz.kafka.core;

public enum UpdateConsumer implements Consumer {
    OVERTIME_TOTAL("加班累计");

    private static final String CONSUMER_PREFIX = "CID_UPDATE";
    private static final String SEPARATOR = "_";

    private final String description;

    UpdateConsumer(String description) {
        this.description = description;
    }

    @Override
    public String getConsumerName(String suffix) {
        return CONSUMER_PREFIX + SEPARATOR + this.toString() + SEPARATOR + suffix;
    }

    public String getDescription() {
        return description;
    }
}
