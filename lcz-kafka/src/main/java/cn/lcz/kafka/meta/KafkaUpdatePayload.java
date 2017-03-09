package cn.lcz.kafka.meta;

import java.util.List;

public class KafkaUpdatePayload<T> {
    private String companyId;
    private List<T> oldValue;
    private List<T> newValue;

    public KafkaUpdatePayload() {

    }

    public KafkaUpdatePayload(String companyId, List<T> oldValue, List<T> newValue) {
        this.companyId = companyId;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public List<T> getOldValue() {
        return oldValue;
    }

    public void setOldValue(List<T> oldValue) {
        this.oldValue = oldValue;
    }

    public List<T> getNewValue() {
        return newValue;
    }

    public void setNewValue(List<T> newValue) {
        this.newValue = newValue;
    }
}
