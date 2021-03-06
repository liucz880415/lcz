package cn.lcz.dubbo;

import cn.lcz.biz.kafka.service.ExceptionRecordService;
import cn.lcz.biz.kafka.service.TestKafkaService;
import cn.lcz.biz.kafka.service.TestKafkaUpdateService;
import cn.lcz.biz.user.service.LczUserService;
import cn.lcz.kafka.core.KafkaTag;
import cn.lcz.meta.kafka.TestKafkaEntity;
import com.alibaba.dubbo.config.annotation.Service;
import com.alibaba.fastjson.JSON;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by liuchuanzhu on 2017/3/3.
 */
@Service(version = "1.0")
public class LczDubboServiceImpl implements LczDubboService {


    @Autowired
    private TestKafkaService testKafkaService;
    @Autowired
    private ExceptionRecordService exceptionRecordService;
    @Autowired
    private TestKafkaUpdateService testKafkaUpdateService;
    @Autowired
    private LczUserService lczUserService;

    @Override
    public String testDubboDemo() {
        System.out.println("================== test dubbo success");

        //保存mongo
//        exceptionRecordService.save("TEST_MONGO","诶快递了你的女神来打开手机为啥你的反馈都是几点返款了但实际上", "jsdkfssdfksjfkjskfjskjfkdsjkfsfds", "test/demo.do","127.0.0.1");

        //模拟创建kafka producer
        String messageId = testKafkaService.testKafka("test kafka", "kafka message content");
        System.out.println("messageId = " + messageId);

        //新增mysql数据库
//        lczUserService.insertUser("test", 23, "还剩多少都是第三方师傅的说法");

        return "success";
    }


    @Override
    public void notifyMessage(TestKafkaEntity entity) {
        System.out.println("notify message start : " + JSON.toJSONString(entity));
    }


    @Override
    public String testKafkaDemo(String tag) {

        System.out.println(tag + " message kafka start");
        testKafkaUpdateService.sendUpdateMessage(KafkaTag.valueOf(tag));
        return null;
    }
}
