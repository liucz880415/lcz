package cn.lcz.web.controller.vo;

import com.alibaba.fastjson.JSON;

public class LoginResponseVO {

    private Boolean success;

    private String message;

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }


    public String toJson() {
        return JSON.toJSONString(this);
    }
}
