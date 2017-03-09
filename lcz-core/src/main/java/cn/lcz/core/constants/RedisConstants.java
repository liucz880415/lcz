package cn.lcz.core.constants;

public class RedisConstants {
    // key: userToken (sessionKey), value: CommonHeader.
    public final static String SESSION_KEY = "app.session.map";// token : json{commonheader}
    // key: userId (mobileNo), value: StaffMessage
    public final static String MOBILEPHONE_KEY = "app.mobile.map"; //os.osversion : counter
    public final static String SALARY_PASSWORD_SESSION_KEY = "app.salary.password.session";
    public final static String SALARY_PASSWORD_RESET_KEY = "app.salary.password.reset";

    public final static String PV_TOTAL_KEY = "counter.pv.total";
    // key: userId (mobileNo), value: channelId:deviceType
    public final static String BAIDU_CHANNEL_KEY = "app.baidu.channel.map"; // staffid : channelid
    // key: channelId, value: userId (mobileNo)
    public final static String MOBILE_BAIDU_CHANNEL_KEY = "app.mobile.baidu.channel.map";

    public final static String COMMON_VALIDATION_CODE_KEY = "common.validation.code";
}
