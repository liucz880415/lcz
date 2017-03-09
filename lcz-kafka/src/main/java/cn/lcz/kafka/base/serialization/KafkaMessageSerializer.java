package cn.lcz.kafka.base.serialization;

import cn.lcz.kafka.meta.KafkaMessage;
import com.alibaba.fastjson.JSON;
import com.google.common.base.Charsets;
import org.apache.kafka.common.serialization.Serializer;

import java.util.Map;

public class KafkaMessageSerializer implements Serializer<KafkaMessage> {
    @Override
    public void configure(Map<String, ?> configs, boolean isKey) {
        // nothing to do
    }

    @Override
    public byte[] serialize(String topic, KafkaMessage data) {
        String json = JSON.toJSONString(data);
        return json.getBytes(Charsets.UTF_8);
    }

    @Override
    public void close() {
        // nothing to do
    }
}
