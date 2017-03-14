package cn.lcz.dubbo;

import cn.lcz.meta.kafka.TestKafkaEntity;

/**
 * Created by liuchuanzhu on 2017/3/3.
 */
public interface LczDubboService {

    String testDubboDemo();

    void notifyMessage(TestKafkaEntity entity);

    String testKafkaDemo(String tag);
}
