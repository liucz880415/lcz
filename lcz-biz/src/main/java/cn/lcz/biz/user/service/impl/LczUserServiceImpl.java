package cn.lcz.biz.user.service.impl;

import cn.lcz.biz.user.dao.mysql.LczUserMapper;
import cn.lcz.biz.user.service.LczUserService;
import cn.lcz.core.utils.UUIDTools;
import cn.lcz.meta.dto.user.mysql.LczUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Created by liuchuanzhu on 2017/3/15.
 */
@Service
public class LczUserServiceImpl implements LczUserService {

    @Autowired
    private LczUserMapper lczUserMapper;

    @Override
    @Transactional
    public LczUser insertUser(String name, int age, String remark) {
        LczUser user = new LczUser();
        user.setAge(age);
        user.setName(name);
        user.setRemark(remark);
        user.setId(UUIDTools.getUUID());
        lczUserMapper.insert(user);
        return user;
    }

    @Override
    public LczUser queryByUserName(String username) {
        return lczUserMapper.queryByUserName(username);
    }

    @Override
    public LczUser queryById(String userId) {
        return lczUserMapper.selectByPrimaryKey(userId);
    }
}
