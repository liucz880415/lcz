package cn.lcz.biz.kafka.service.impl;

import cn.lcz.biz.kafka.dao.mongo.ExceptionMongoRecordDao;
import cn.lcz.biz.kafka.service.ExceptionRecordService;
import cn.lcz.meta.dto.common.mongo.ExceptionMongoRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ExceptionRecordServiceImpl implements ExceptionRecordService {

    @Autowired
    private ExceptionMongoRecordDao exceptionMongoRecordDao;

    @Override
    public ExceptionMongoRecord save(ExceptionMongoRecord webExceptionRecord) {
        return exceptionMongoRecordDao.save(webExceptionRecord);
    }

    @Override
    public ExceptionMongoRecord save(String type, String message, String stackTrace, String url, String serverIp) {
        ExceptionMongoRecord webExceptionRecord = new ExceptionMongoRecord();
        webExceptionRecord.setType(type);
        webExceptionRecord.setMessage(message);
        webExceptionRecord.setStackTrace(stackTrace);
        webExceptionRecord.setUrl(url);
        webExceptionRecord.setServerIp(serverIp);
        //webExceptionRecord.setVersion(gitVersion.getVersion());
        //webExceptionRecord.setCommitId(gitVersion.getCommitId());
        //webExceptionRecord.setCommitTime(gitVersion.getCommitTime());
        return save(webExceptionRecord);
    }
}
