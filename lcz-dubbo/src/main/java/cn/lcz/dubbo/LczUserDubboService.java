package cn.lcz.dubbo;

import cn.lcz.meta.dto.user.mysql.LczUser;

/**
 * Created by liuchuanzhu on 2017/3/20.
 */
public interface LczUserDubboService {

    LczUser queryByUserName(String username);

    LczUser queryById(String userId);
}
