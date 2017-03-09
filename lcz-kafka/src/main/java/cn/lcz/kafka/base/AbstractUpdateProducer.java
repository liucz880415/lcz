package cn.lcz.kafka.base;

import cn.lcz.kafka.core.KafkaTag;
import cn.lcz.kafka.core.UpdateTopic;
import cn.lcz.kafka.meta.KafkaMessage;
import cn.lcz.kafka.meta.KafkaUpdatePayload;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nonnull;
import java.util.List;

public abstract class AbstractUpdateProducer<T> extends AbstractProducer {
    private static final Logger logger = LoggerFactory.getLogger(AbstractUpdateProducer.class);

    protected AbstractUpdateProducer(final UpdateTopic topic) {
        super(topic);
    }

    public String update(@Nonnull KafkaTag tag, T oldValue, T newValue, String companyId) {
        List<T> oldValueList = Lists.newArrayList();
        if (oldValue != null) {
            oldValueList.add(oldValue);
        }
        List<T> newValueList = Lists.newArrayList();
        if (newValue != null) {
            newValueList.add(newValue);
        }
        return update(tag, oldValueList, newValueList, companyId);
    }

    public String update(@Nonnull KafkaTag tag, List<T> oldValueList, List<T> newValueList, String companyId) {
        if (oldValueList == null || oldValueList.size() == 0) {
            oldValueList = null;
        }
        if (newValueList == null || newValueList.size() == 0) {
            newValueList = null;
        }
        if (newValueList == null && oldValueList == null) {
            return null;
        }

        KafkaUpdatePayload<T> payload = new KafkaUpdatePayload<>(companyId, oldValueList, newValueList);
        String payloadJson = JSON.toJSONString(payload, SerializerFeature.WriteClassName);

        // Cut the payload into two halves, and send them separately.
        return doUpdate(tag, payloadJson);
    }

    private String doUpdate(@Nonnull KafkaTag tag, String payloadJson) {
        KafkaMessage kafkaMessage = new KafkaMessage(Sets.newHashSet(tag), payloadJson);

        logger.debug("Sending Update Message: {}.", payloadJson);
        return sendAfterTransactionCommit(kafkaMessage);
    }
}
