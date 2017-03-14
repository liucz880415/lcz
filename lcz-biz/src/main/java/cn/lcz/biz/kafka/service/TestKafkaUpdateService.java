package cn.lcz.biz.kafka.service;

import cn.lcz.kafka.core.KafkaTag;

/**
 * Created by liuchuanzhu on 2017/3/14.
 */
public interface TestKafkaUpdateService {

    String sendUpdateMessage(KafkaTag tag);
}
