package cn.lcz.dubbo;

import com.alibaba.dubbo.config.annotation.Service;

/**
 * Created by liuchuanzhu on 2017/3/3.
 */
@Service(version = "1.0")
public class LczDubboServiceImpl implements LczDubboService {


    @Override
    public String testDubboDemo() {
        System.out.println("================== test dubbo success");

        //模拟创建kafka producer

        return "success";
    }
}
