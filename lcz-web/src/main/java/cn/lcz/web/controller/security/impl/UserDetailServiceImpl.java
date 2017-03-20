package cn.lcz.web.controller.security.impl;

import cn.lcz.dubbo.LczUserDubboService;
import cn.lcz.meta.dto.user.mysql.LczUser;
import cn.lcz.web.controller.security.entity.LczUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailServiceImpl implements UserDetailsService {

    @Autowired
    private LczUserDubboService lczUserDubboService;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        LczUser user = lczUserDubboService.queryById(userId);
        if (user == null) {
            throw new UsernameNotFoundException(userId);
        }
        return new LczUserDetails(user.getId(), user.getName(), user.getPassWord());
    }
}
