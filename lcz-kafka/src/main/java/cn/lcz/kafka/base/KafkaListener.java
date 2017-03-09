package cn.lcz.kafka.base;

import cn.lcz.kafka.meta.KafkaMessage;

public abstract class KafkaListener {
    abstract void onMessage(KafkaMessage message);
}
