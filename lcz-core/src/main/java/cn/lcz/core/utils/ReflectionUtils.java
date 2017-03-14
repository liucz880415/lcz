package cn.lcz.core.utils;

import cn.lcz.meta.annotation.Key;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Field;

public class ReflectionUtils {
    private static final Logger logger = LoggerFactory.getLogger(ReflectionUtils.class);

    public static Object getKey(Object obj) {
        if (obj == null) {
            return null;
        }
        for (Field field : obj.getClass().getDeclaredFields()) {
            if (field.isAnnotationPresent(Key.class)) {
                try {
                    field.setAccessible(true);
                    return field.get(obj);
                } catch (IllegalAccessException e) {
                    logger.error("Cannot get field: {}. Reason: {}.", field.getName(), e.getMessage());
                    return null;
                }
            }
        }
        throw new RuntimeException("No @Key specified for class: " + obj.getClass().getName());
    }
}