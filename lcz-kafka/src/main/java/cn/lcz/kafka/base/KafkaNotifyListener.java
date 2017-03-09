package cn.lcz.kafka.base;

import cn.lcz.kafka.meta.KafkaMessage;
import com.alibaba.fastjson.JSON;

import java.lang.reflect.ParameterizedType;

public abstract class KafkaNotifyListener<T> extends KafkaListener {
    /**
     * 消费消息接口，由应用来实现<br>
     *
     * @param data 消息
     * @return 消费结果，如果应用抛出异常或者返回Null等价于返回Action.ReconsumeLater
     */
    protected abstract void onNotify(T data);

    final void onMessage(KafkaMessage message) {
        onNotify(message.getPayload());
    }

    private void onNotify(String jsonData) {
        T data = JSON.parseObject(jsonData, getDataType());
        onNotify(data);
    }

    private Class<T> getDataType() {
        return (Class<T>) ((ParameterizedType) getClass().getGenericSuperclass()).getActualTypeArguments()[0];
    }
}
