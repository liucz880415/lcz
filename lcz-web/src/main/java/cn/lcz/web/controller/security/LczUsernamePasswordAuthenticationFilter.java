package cn.lcz.web.controller.security;

import cn.lcz.dubbo.LczUserDubboService;
import cn.lcz.meta.dto.user.mysql.LczUser;
import cn.lcz.web.controller.vo.LoginRequestVO;
import cn.lcz.web.controller.vo.LoginResponseVO;
import com.alibaba.dubbo.common.json.JSON;
import com.alibaba.dubbo.common.json.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStreamReader;

public class LczUsernamePasswordAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    @Autowired
    private LczUserDubboService lczUserDubboService;

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        if (!request.getMethod().equals("POST")) {
            throw new AuthenticationServiceException("Authentication method not supported: " + request.getMethod());
        }
        LoginRequestVO loginRequestVO;
        try {
            loginRequestVO = JSON.parse(new InputStreamReader(request.getInputStream(), "UTF-8"), LoginRequestVO.class);
        } catch (IOException | ParseException e) {
            throw new RuntimeException(e);
        }

        LczUser user = lczUserDubboService.queryByUserName(loginRequestVO.getUsername());
        if (user == null) {
            LoginResponseVO loginResponseVO = new LoginResponseVO();
            loginResponseVO.setSuccess(false);
            loginResponseVO.setMessage("未登录！");
            try {
                response.getWriter().println(loginResponseVO.toJson());
            } catch (IOException e) {
                e.printStackTrace();
            }
            throw new AuthenticationServiceException("未登录！");
        }
        if (!loginRequestVO.getPassword().equals(user.getPassWord())) {
            throw new AuthenticationServiceException("用户名密码错误！");
        }

        UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(user.getId(), user.getId());

        setDetails(request, authRequest);

        return this.getAuthenticationManager().authenticate(authRequest);
    }

}
