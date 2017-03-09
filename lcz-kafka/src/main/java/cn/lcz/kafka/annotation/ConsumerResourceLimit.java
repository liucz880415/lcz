package cn.lcz.kafka.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ConsumerResourceLimit {
    // 指定Consumer最多有多少个线程同时执行。
    int thread() default 20;
}
