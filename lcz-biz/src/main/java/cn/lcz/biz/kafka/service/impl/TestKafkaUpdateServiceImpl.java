package cn.lcz.biz.kafka.service.impl;

import cn.lcz.biz.kafka.service.TestKafkaUpdateService;
import cn.lcz.kafka.base.AbstractUpdateProducer;
import cn.lcz.kafka.core.KafkaTag;
import cn.lcz.kafka.core.UpdateTopic;
import cn.lcz.meta.kafka.KafkaUpdateEntity;
import com.google.common.collect.Lists;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by liuchuanzhu on 2017/3/14.
 */
@Service
public class TestKafkaUpdateServiceImpl extends AbstractUpdateProducer<KafkaUpdateEntity> implements TestKafkaUpdateService {

    public TestKafkaUpdateServiceImpl() {
        super(UpdateTopic.TEST_UPDATE_KAFKA);
    }

    @Override
    public String sendUpdateMessage(KafkaTag tag) {

        List<KafkaUpdateEntity> list = Lists.newArrayList();
        list.add(new KafkaUpdateEntity("zhangsan", "会计师的方式"));
        list.add(new KafkaUpdateEntity("lisi", "wonderful day"));

        return update(tag, null, list, "test-companyId");
    }
}
