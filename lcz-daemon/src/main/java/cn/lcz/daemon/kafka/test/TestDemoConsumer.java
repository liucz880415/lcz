package cn.lcz.daemon.kafka.test;

import cn.lcz.dubbo.LczDubboService;
import cn.lcz.kafka.base.AbstractNotifyConsumer;
import cn.lcz.kafka.base.KafkaNotifyListener;
import cn.lcz.kafka.core.NotifyTopic;
import cn.lcz.meta.kafka.TestKafkaEntity;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class TestDemoConsumer extends AbstractNotifyConsumer<TestKafkaEntity> {
    private static final Logger logger = LoggerFactory.getLogger(TestDemoConsumer.class);
    @Autowired
    private LczDubboService lczDubboService;

    protected TestDemoConsumer() {
        super(NotifyTopic.TEST_DEMO);
    }

    @Override
    protected List<KafkaNotifyListener<TestKafkaEntity>> getListeners() {
        KafkaNotifyListener listener = new KafkaNotifyListener<TestKafkaEntity>() {
            @Override
            public void onNotify(TestKafkaEntity entity) {
                try {
                    lczDubboService.notifyMessage(entity);
                } catch (Exception e) {
                    logger.error("non-active user login consumer: {}.", e.getMessage());
                }
            }
        };
        return Lists.newArrayList(listener);
    }
}
