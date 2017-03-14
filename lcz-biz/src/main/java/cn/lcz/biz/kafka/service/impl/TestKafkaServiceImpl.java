package cn.lcz.biz.kafka.service.impl;

import cn.lcz.biz.kafka.service.TestKafkaService;
import cn.lcz.kafka.base.AbstractNotifyProducer;
import cn.lcz.kafka.core.NotifyTopic;
import cn.lcz.meta.kafka.TestKafkaEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Created by liuchuanzhu on 2017/3/13.
 */
@Service
public class TestKafkaServiceImpl extends AbstractNotifyProducer<TestKafkaEntity> implements TestKafkaService {

    private static final Logger logger = LoggerFactory.getLogger(TestKafkaServiceImpl.class);

    protected TestKafkaServiceImpl() {
        super(NotifyTopic.TEST_DEMO);
    }

    @Override
    public String testKafka(String name, String message) {
        return notify(new TestKafkaEntity(name, message));
    }

}
