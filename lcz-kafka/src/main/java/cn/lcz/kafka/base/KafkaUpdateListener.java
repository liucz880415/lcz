package cn.lcz.kafka.base;

import cn.lcz.kafka.core.KafkaTag;
import cn.lcz.kafka.meta.KafkaMessage;
import cn.lcz.kafka.meta.KafkaUpdatePayload;
import com.alibaba.fastjson.JSON;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public abstract class KafkaUpdateListener<T> extends KafkaListener {
    private static final Logger logger = LoggerFactory.getLogger(KafkaUpdateListener.class);
    private final KafkaTag tag;

    protected KafkaUpdateListener(KafkaTag tag) {
        this.tag = tag;
    }

    protected abstract void onUpdate(String companyId, List<T> oldData, List<T> newData);

    final void onMessage(KafkaMessage message) {
        // Skip the message that doesn't contain the KafkaTag.
        if (!message.getTags().contains(tag)) {
            return;
        }
        onUpdate(message.getPayload());
    }

    private void onUpdate(String jsonData) {
        KafkaUpdatePayload<T> data;
        try {
            data = (KafkaUpdatePayload<T>) JSON.parse(jsonData);
        } catch (Throwable e) {
            logger.error("Cannot parse JSON data: {}, skipping.", jsonData);
            return;
        }
        onUpdate(data.getCompanyId(), data.getOldValue(), data.getNewValue());
    }
}
