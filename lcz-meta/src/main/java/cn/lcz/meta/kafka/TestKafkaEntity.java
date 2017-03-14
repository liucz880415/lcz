package cn.lcz.meta.kafka;

import java.io.Serializable;

/**
 * Created by liuchuanzhu on 2017/3/13.
 */
public class TestKafkaEntity implements Serializable {

    private String name;
    private String message;

    public TestKafkaEntity() {
    }

    public TestKafkaEntity(String name, String message) {
        this.name = name;
        this.message = message;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
