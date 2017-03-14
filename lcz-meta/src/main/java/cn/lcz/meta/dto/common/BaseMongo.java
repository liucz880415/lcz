package cn.lcz.meta.dto.common;

import org.bson.types.ObjectId;

import java.io.Serializable;
import java.util.Date;

public abstract class BaseMongo implements Serializable {
    private ObjectId id;
    private Date createdDate = new Date();

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }
}
