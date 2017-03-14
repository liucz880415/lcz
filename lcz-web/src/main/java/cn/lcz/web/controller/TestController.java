package cn.lcz.web.controller;

import cn.lcz.core.utils.RedisUtil;
import cn.lcz.dubbo.LczDubboService;
import cn.lcz.meta.kafka.TestKafkaEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by liuchuanzhu on 2017/3/7.
 */
@Controller
@RequestMapping("/test")
public class TestController {

    @Autowired
    private LczDubboService lczDubboService;
    @Autowired
    private RedisUtil redisUtil;


    @RequestMapping("/demo")
    public void testDubbo() {
        lczDubboService.testDubboDemo();

        redisUtil.hset(new TestKafkaEntity("test redis", "kafka redis entity"));

    }

}
