package cn.lcz.web.controller;

import cn.lcz.dubbo.LczDubboService;
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


    @RequestMapping("/demo")
    public void testDubbo(){
        lczDubboService.testDubboDemo();
    }

}
