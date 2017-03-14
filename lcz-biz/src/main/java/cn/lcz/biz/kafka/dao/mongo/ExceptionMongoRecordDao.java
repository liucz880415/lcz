package cn.lcz.biz.kafka.dao.mongo;

import cn.lcz.meta.dto.common.mongo.ExceptionMongoRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ExceptionMongoRecordDao extends MongoRepository<ExceptionMongoRecord, String> {

    ExceptionMongoRecord save(ExceptionMongoRecord webExceptionRecord);

}
