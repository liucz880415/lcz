package cn.lcz.kafka.base.serialization;

import cn.lcz.kafka.meta.KafkaMessage;
import com.alibaba.fastjson.JSON;
import com.google.common.base.Charsets;
import org.apache.kafka.common.serialization.Deserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

public class KafkaMessageDeserializer implements Deserializer<KafkaMessage> {
    Logger logger = LoggerFactory.getLogger(KafkaMessageDeserializer.class);

    @Override
    public void configure(Map<String, ?> configs, boolean isKey) {
        // nothing to do
    }

    @Override
    public KafkaMessage deserialize(String topic, byte[] data) {
        String json = new String(data, Charsets.UTF_8);
        try {
            return JSON.parseObject(json, KafkaMessage.class);
        } catch (Throwable e) {
            logger.error("Skipping malformed data: {}.", json);
            return null;
        }
    }

    @Override
    public void close() {
        // nothing to do
    }
}
