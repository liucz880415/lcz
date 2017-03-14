package cn.lcz.biz.kafka.service;


import cn.lcz.meta.dto.common.mongo.ExceptionMongoRecord;

public interface ExceptionRecordService {

    ExceptionMongoRecord save(ExceptionMongoRecord webExceptionRecord);
    ExceptionMongoRecord save(String type, String message, String stackTrace, String url, String serverIp);
}
