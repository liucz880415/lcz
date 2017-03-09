package cn.lcz.kafka.base;

import cn.lcz.kafka.core.NotifyTopic;
import cn.lcz.kafka.meta.KafkaMessage;
import com.alibaba.fastjson.JSON;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nonnull;

public abstract class AbstractNotifyProducer<T> extends AbstractProducer {
    private static final Logger logger = LoggerFactory.getLogger(AbstractNotifyProducer.class);

    protected AbstractNotifyProducer(final NotifyTopic topic) {
        super(topic);
    }

    public String notify(@Nonnull T notifyData) {
        KafkaMessage kafkaMessage = new KafkaMessage(null, JSON.toJSONString(notifyData));
        logger.debug("Sending Notify Message: {}.", JSON.toJSONString(notifyData));
        return sendAfterTransactionCommit(kafkaMessage);
    }
}
