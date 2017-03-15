package cn.lcz.daemon.kafka.test;

import cn.lcz.kafka.base.AbstractUpdateConsumer;
import cn.lcz.kafka.base.KafkaUpdateListener;
import cn.lcz.kafka.core.KafkaTag;
import cn.lcz.kafka.core.UpdateConsumer;
import cn.lcz.kafka.core.UpdateTopic;
import cn.lcz.meta.kafka.KafkaUpdateEntity;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Created by liuchuanzhu on 2017/3/14.
 */
@Service
public class TestUpdateDemoConsumer extends AbstractUpdateConsumer {

    public TestUpdateDemoConsumer() {
        super(UpdateConsumer.OVERTIME_TOTAL);
    }

    @Override
    protected Map<UpdateTopic, List<KafkaUpdateListener>> getListeners() {
        Map<UpdateTopic, List<KafkaUpdateListener>> listeners = Maps.newHashMap();

        // 添加对于每一个Topic的订阅处理
        listeners.put(UpdateTopic.TEST_UPDATE_KAFKA, Lists.newArrayList(
                new KafkaUpdateListener(KafkaTag.NEW) {
                    @Override
                    protected void onUpdate(String companyId, List oldData, List newData) {
                        System.out.println("new add entity handle...");
                    }
                },
                new KafkaUpdateListener<KafkaUpdateEntity>(KafkaTag.UPDATE) {
                    @Override
                    protected void onUpdate(String companyId, List<KafkaUpdateEntity> oldData, List<KafkaUpdateEntity> newData) {
                        System.out.println("update entity handle...");
                    }
                },
                new KafkaUpdateListener<KafkaUpdateEntity>(KafkaTag.DELETE) {
                    @Override
                    protected void onUpdate(String companyId, List<KafkaUpdateEntity> oldData, List<KafkaUpdateEntity> newData) {
                        System.out.println("delete entity handle...");
                    }
                }
        ));

        return listeners;
    }

}
