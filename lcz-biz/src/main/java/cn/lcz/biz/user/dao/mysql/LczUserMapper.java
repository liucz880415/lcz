package cn.lcz.biz.user.dao.mysql;

import cn.lcz.meta.dto.user.mysql.LczUser;

public interface LczUserMapper {
    int deleteByPrimaryKey(String id);

    int insert(LczUser record);

    int insertSelective(LczUser record);

    LczUser selectByPrimaryKey(String id);

    int updateByPrimaryKeySelective(LczUser record);

    int updateByPrimaryKeyWithBLOBs(LczUser record);

    int updateByPrimaryKey(LczUser record);
}