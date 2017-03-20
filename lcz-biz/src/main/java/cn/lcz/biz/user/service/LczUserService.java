package cn.lcz.biz.user.service;

import cn.lcz.meta.dto.user.mysql.LczUser;

/**
 * Created by liuchuanzhu on 2017/3/15.
 */
public interface LczUserService {

    LczUser insertUser(String name, int age, String remark);

    LczUser queryByUserName(String username);

    LczUser queryById(String userId);
}
