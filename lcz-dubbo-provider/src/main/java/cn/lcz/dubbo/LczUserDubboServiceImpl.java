package cn.lcz.dubbo;

import cn.lcz.biz.user.service.LczUserService;
import cn.lcz.meta.dto.user.mysql.LczUser;
import com.alibaba.dubbo.config.annotation.Service;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by liuchuanzhu on 2017/3/20.
 */
@Service(version = "1.0")
public class LczUserDubboServiceImpl implements LczUserDubboService {

    @Autowired
    private LczUserService lczUserService;

    @Override
    public LczUser queryByUserName(String username) {
        return lczUserService.queryByUserName(username);
    }

    @Override
    public LczUser queryById(String userId) {
        return lczUserService.queryById(userId);
    }
}
