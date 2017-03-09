package cn.lcz.core.utils;

import cn.lcz.config.redis.beans.RedisConfig;
import cn.lcz.core.annotation.RedisCounter;
import cn.lcz.core.annotation.RedisExpire;
import cn.lcz.core.annotation.RedisList;
import cn.lcz.core.annotation.RedisSet;
import com.alibaba.fastjson.JSON;
import com.google.common.base.Charsets;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import redis.clients.jedis.exceptions.JedisConnectionException;

import javax.annotation.Nonnull;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public final class RedisUtil {
    private final static Logger logger = LoggerFactory.getLogger(RedisUtil.class);

    private final JedisPool jedisPool;
    private final ThreadLocal<Jedis> jedis = new ThreadLocal<>();

    /**
     * 初始化Redis连接池
     */
    @Autowired
    public RedisUtil(RedisConfig redisConfig) {
        JedisPoolConfig jedisPoolConfig = new JedisPoolConfig();
        jedisPoolConfig.setMaxTotal(redisConfig.getMaxTotal());
        jedisPoolConfig.setMaxIdle(redisConfig.getMaxIdle());
        jedisPoolConfig.setMinIdle(redisConfig.getMinIdle());
        jedisPoolConfig.setMaxWaitMillis(redisConfig.getMaxWaitMillis());

        jedisPoolConfig.setTestOnBorrow(redisConfig.isTestOnBorrow());
        jedisPoolConfig.setTestOnReturn(redisConfig.isTestOnReturn());
        jedisPoolConfig.setTestWhileIdle(redisConfig.isTestWhileIdle());
        jedisPoolConfig.setTimeBetweenEvictionRunsMillis(redisConfig.getTimeBetweenEvictionRunsMillis());
        jedisPoolConfig.setNumTestsPerEvictionRun(redisConfig.getNumTestsPerEvictionRun());
        jedisPoolConfig.setMinEvictableIdleTimeMillis(redisConfig.getMinEvictableIdleTimeMillis());
        jedisPool = new JedisPool(jedisPoolConfig, redisConfig.getAddress(), redisConfig.getPort(),
                redisConfig.getTimeout(), redisConfig.getAuth(), redisConfig.getDatabase());
    }

    /**
     * 获取Jedis实例
     *
     * @return
     */
    private Jedis getJedis() {
        try {
            return jedisPool.getResource();
        } catch (JedisConnectionException e) {
            logger.error("Redis connection exception: {}.", e.getMessage());
            logger.error("Redis active connection: {}.", jedisPool.getNumActive());
            throw e;
        }
    }

    private void returnJedis(Jedis jedis) {
        try {
            jedisPool.returnResource(jedis);
        } catch (Throwable e) {
            logger.error("Error returning redis resources: {}.", e.getMessage());
            jedisPool.returnBrokenResource(jedis);
        }
    }

    // 该函数会在Request线程启动的时候调用。@See RedisUtilsInterceptor
    // !!WARNING!! Call this only if you know what you are doing.
    private void _start() {
        if (jedis.get() == null) {
            jedis.set(this.getJedis());
        }
    }

    // 该函数会在Request线程结束的时候调用。@See RedisUtilsInterceptor
    // !!WARNING!! Call this only if you know what you are doing.
    private void _end() {
        if (jedis.get() != null) {
            this.returnJedis(jedis.get());
            jedis.set(null);
        }
    }

    public <T> void hset(@Nonnull T obj) {
        Object key = ReflectionUtils.getKey(obj);
        if (key == null) {
            logger.error("No @Key specified for obj of class: {}", obj.getClass().getName());
            return;
        }

        String tableName = obj.getClass().getName();
        String keyString = key.toString();

        hset(tableName, keyString, obj);
    }

    /**
     * Use `public <T> void hset(T obj)` instead.
     *
     * @param table
     * @param key
     * @param value
     */
    private void hset(String table, String key, String value) {
        if (Strings.isNullOrEmpty(table) || Strings.isNullOrEmpty(key) || Strings.isNullOrEmpty(value)) {
            return;
        }

        _start();
        jedis.get().hset(table, key, value);
        _end();
    }

    /**
     * Use `public <T> void hset(T obj)` instead.
     *
     * @param table
     * @param key
     * @param obj
     */
    private void hset(String table, String key, Object obj) {
        if (Strings.isNullOrEmpty(table) || Strings.isNullOrEmpty(key) || obj == null) {
            return;
        }

        _start();
        jedis.get().hset(table, key, JSON.toJSONString(obj));
        _end();
    }

    /**
     * Use `public <T> T hget(Class<T> cls, String key)` instead.
     *
     * @param table
     * @param key
     * @return
     */
    @Deprecated
    public String hget(String table, String key) {
        if (Strings.isNullOrEmpty(table) || Strings.isNullOrEmpty(key)) {
            return null;
        }

        _start();
        String res = jedis.get().hget(table, key);
        _end();
        return res;
    }

    /**
     * Use `public <T> T hget(Class<T> cls, String key)` instead.
     *
     * @param table
     * @param key
     * @param cls
     * @param <T>
     * @return
     */
    private <T> T hget(String table, String key, Class<T> cls) {
        if (Strings.isNullOrEmpty(table) || Strings.isNullOrEmpty(key)) {
            return null;
        }

        _start();
        String result = jedis.get().hget(table, key);
        _end();
        if (Strings.isNullOrEmpty(result)) {
            return null;
        }

        return JSON.parseObject(result, cls);
    }

    public <T> T hget(Class<T> cls, Object key) {
        if (key == null) {
            return null;
        }

        if (cls == null) {
            logger.error("No type specified.");
            return null;
        }
        String tableName = cls.getName();
        String keyString = key.toString();
        return hget(tableName, keyString, cls);
    }

    /**
     * 根据@Key的值获取对象
     *
     * @param keyObj
     * @param <T>
     * @return
     */
    public <T> T hget(@Nonnull T keyObj) {
        Object key = ReflectionUtils.getKey(keyObj);
        if (key == null) {
            logger.error("No @Key specified for keyObj of class: {}", keyObj.getClass().getName());
            return null;
        }

        Class<T> cls = (Class<T>) keyObj.getClass();
        String tableName = keyObj.getClass().getName();
        String keyString = key.toString();
        return hget(tableName, keyString, cls);
    }

    /**
     * Use `hset` instead.
     *
     * @param key
     * @param obj
     */
    private void set(String key, Object obj) {
        if (Strings.isNullOrEmpty(key) || obj == null) {
            return;
        }

        _start();
        jedis.get().set(key, JSON.toJSONString(obj));
        _end();
    }

    /**
     * Use `hget` instead.
     *
     * @param key
     * @return
     */
    private String get(String key) {
        if (Strings.isNullOrEmpty(key)) {
            return null;
        }
        _start();
        String res = jedis.get().get(key);
        _end();
        return res;
    }

    /**
     * Use `hgetAll` instead.
     *
     * @param table
     * @return
     */
    @Deprecated
    public Map<String, String> hgetAll(String table) {
        if (Strings.isNullOrEmpty(table)) {
            return null;
        }

        _start();
        Map<String, String> map = jedis.get().hgetAll(table);
        _end();
        return map;
    }

    /**
     * 尽量不要使用hgetAll，这个函数根据数据量会有指数级别的资源消耗。
     *
     * @param cls
     * @param <T>
     * @return
     */
    @Deprecated
    public <T> List<T> hgetAll(Class<T> cls) {
        assert (cls != null);

        String tableName = cls.getName();
        Map<String, String> all = hgetAll(tableName);
        if (all == null) {
            return null;
        }
        List<T> result = Lists.newArrayList();

        for (String value : all.values()) {
            result.add(JSON.parseObject(value, cls));
        }

        return result;
    }

    /**
     * Use `public <T> void hdel(Class<T> cls, String... keys)` instead.
     *
     * @param table
     * @param keys
     */
    @Deprecated
    public void hdel(String table, String... keys) {
        if (Strings.isNullOrEmpty(table) || keys == null || keys.length == 0) {
            return;
        }

        _start();
        jedis.get().hdel(table, keys);
        _end();
    }

    public <T> void hdel(@Nonnull Class<T> cls, Object... keys) {
        if (keys == null || keys.length == 0) {
            return;
        }
        String tableName = cls.getName();
        List<String> keyStrings = Lists.newArrayList(keys).stream().filter(key -> key != null).map(Object::toString).collect(Collectors.toList());
        if (CollectionUtils.isEmpty(keyStrings)) {
            return;
        }
        String[] keyArray = new String[keyStrings.size()];
        keyStrings.toArray(keyArray);
        hdel(tableName, keyArray);
    }

    public <T> void hdel(@Nonnull T object) {
        hdel(object.getClass(), ReflectionUtils.getKey(object));
    }

    /**
     * -------------------------------------------- For Timer Objects -----------------------------------------------
     */
    private <T> void checkExpire(@Nonnull Class<T> cls) {
        if (cls.getAnnotation(RedisExpire.class) == null) {
            throw new RuntimeException("此Class必须增加RedisExpire注解");
        }
    }

    /**
     * Save the given object, with a timeout of unit in seconds.
     *
     * @param obj     The object to store.
     * @param timeout expire time in seconds.
     * @param <T>
     */
    public <T> void hsetx(@Nonnull T obj, int timeout) {
        checkExpire(obj.getClass());

        String key = getExpireKey(obj);

        _start();
        jedis.get().set(key, JSON.toJSONString(obj));
        jedis.get().expire(key, timeout);
        _end();
    }

    public <T> T hgetx(@Nonnull T keyObj) {
        checkExpire(keyObj.getClass());

        String key = getExpireKey(keyObj);

        return hgetx(key, (Class<T>) keyObj.getClass());
    }

    public <T> T hgetx(@Nonnull Class<T> cls, @Nonnull Object keyObj) {
        checkExpire(cls);

        String key = getExpireKey(cls, keyObj);

        return hgetx(key, cls);
    }

    private <T> T hgetx(String key, Class<T> cls) {
        checkExpire(cls);

        _start();
        String result = jedis.get().get(key);
        _end();

        if (Strings.isNullOrEmpty(result)) {
            return null;
        }

        return JSON.parseObject(result, cls);
    }

    public <T> void hdelx(@Nonnull Class<T> cls, Object... keys) {
        checkExpire(cls);

        List<String> keyStrings = Lists.newArrayList(keys).stream().map(key -> getExpireKey(cls, key)).collect(Collectors.toList());
        delx(keyStrings);
    }

    public <T> void hdelx(@Nonnull T object) {
        checkExpire(object.getClass());

        String key = getExpireKey(object);
        delx(Lists.newArrayList(key));
    }

    private void delx(List<String> keys) {
        _start();
        keys.stream().forEach(key -> jedis.get().del(key));
        _end();
    }

    private <T> String getExpireKey(@Nonnull Class<T> cls, @Nonnull Object key) {
        final String TIMER_PREFIX = "timer:";
        return TIMER_PREFIX + cls.getName().replace(".", ":") + ":" + key.toString();
    }

    private <T> String getExpireKey(@Nonnull T object) {
        String key = ReflectionUtils.getKey(object).toString();
        return getExpireKey(object.getClass(), key);
    }

    /**
     * -------------------------------------------- For Lists Start -----------------------------------------------
     */
    private <T> void checkList(@Nonnull Class<T> cls) {
        if (cls.getAnnotation(RedisList.class) == null) {
            throw new RuntimeException("此Class必须增加RedisList注解");
        }
    }

    /**
     * List Push. 将给定的元素加入到T.class为key的数组末尾。
     *
     * @param objects
     * @param <T>
     * @return
     */
    public <T> Long lpush(@Nonnull T... objects) {
        return lpush(Lists.newArrayList(objects));
    }

    public <T> Long lpush(@Nonnull List<T> objects) {
        return lpush((String) null, objects);
    }

    public <T> Long lpush(@Nonnull Date timestamp, @Nonnull T... objects) {
        return lpush(timestamp, Lists.newArrayList(objects));
    }

    public <T> Long lpush(@Nonnull Date timestamp, @Nonnull List<T> objects) {
        if (objects.isEmpty()) {
            return null;
        }
        String key = Long.toString(timestamp.getTime());
        return lpush(key, objects);
    }

    public <T> Long lpush(@Nonnull String key, @Nonnull T... objects) {
        return lpush(key, Lists.newArrayList(objects));
    }

    public <T> Long lpush(@Nonnull String key, @Nonnull List<T> objects) {
        if (objects.isEmpty()) {
            return null;
        }
        String listKey = getListKey(objects.get(0).getClass(), key);
        return _lpush(listKey, objects);
    }

    private <T> Long _lpush(@Nonnull String key, @Nonnull List<T> objects) {
        checkList(objects.get(0).getClass());
        _start();
        objects.stream().forEach(object -> jedis.get().lpush(key, JSON.toJSONString(object)));
        _end();
        return (long) objects.size();
    }

    /**
     * 获取给定List中的给定位置的元素。
     *
     * @param cls
     * @param <T>
     * @return
     */
    public <T> List<T> lget(@Nonnull final Class<T> cls, int index) {
        return lrange(cls, index, index + 1);
    }

    public <T> List<T> lget(@Nonnull final Class<T> cls, @Nonnull Date timestamp, int index) {
        return lrange(cls, timestamp, index, index + 1);
    }

    public <T> List<T> lget(@Nonnull final Class<T> cls, @Nonnull String key, int index) {
        return lrange(cls, key, index, index + 1);
    }

    /**
     * 获取给定List中的所有元素。
     *
     * @param cls
     * @param <T>
     * @return
     */
    public <T> List<T> lgetAll(@Nonnull final Class<T> cls) {
        return lrange(cls, 0, Integer.MAX_VALUE);
    }

    public <T> List<T> lgetAll(@Nonnull final Class<T> cls, @Nonnull Date timestamp) {
        return lrange(cls, timestamp, 0, Integer.MAX_VALUE);
    }

    public <T> List<T> lgetAll(@Nonnull final Class<T> cls, @Nonnull String key) {
        return lrange(cls, key, 0, Integer.MAX_VALUE);
    }

    /**
     * List Range，获取以cls.name()为key的数组元素，元素从第start个开始，共返回最多count个元素。
     *
     * @param cls
     * @param start
     * @param count
     * @param <T>
     * @return
     */
    public <T> List<T> lrange(@Nonnull final Class<T> cls, long start, long count) {
        checkList(cls);
        String key = getListKey(cls);
        return _lrange(cls, key, start, count);
    }

    public <T> List<T> lrange(@Nonnull Class<T> cls, @Nonnull Date timestamp, long start, long count) {
        checkList(cls);
        String key = getListKey(cls, timestamp);
        return _lrange(cls, key, start, count);
    }

    public <T> List<T> lrange(@Nonnull Class<T> cls, @Nonnull String key, long start, long count) {
        checkList(cls);
        String listKey = getListKey(cls, key);
        return _lrange(cls, listKey, start, count);
    }

    private <T> List<T> _lrange(@Nonnull Class<T> cls, String key, long start, long count) {
        checkList(cls);
        _start();
        List<String> values = jedis.get().lrange(key, start, start + count - 1);
        _end();

        return values.stream().map(value -> {
            T obj = JSON.parseObject(value, cls);
            return obj;
        }).collect(Collectors.toList());
    }

    /**
     * List Remove，删除掉以cls.name()为key的数组、从头部开始的[start, start+count)元素。
     *
     * @param cls
     * @param start
     * @param count
     * @param <T>
     * @return 删除掉的元素的个数。
     */
    public <T> Long lremove(@Nonnull Class<T> cls, long start, long count) {
        checkList(cls);
        String key = getListKey(cls);
        return _lremove(cls, key, start, count);
    }

    public <T> Long lremove(@Nonnull Class<T> cls, @Nonnull Date timestamp, long start, long count) {
        checkList(cls);
        String key = getListKey(cls, timestamp);
        return _lremove(cls, key, start, count);
    }

    public <T> Long lremove(@Nonnull Class<T> cls, @Nonnull String key, long start, long count) {
        checkList(cls);
        String listKey = getListKey(cls, key);
        return _lremove(cls, listKey, start, count);
    }

    private <T> Long _lremove(@Nonnull Class<T> cls, @Nonnull String key, long start, long count) {
        checkList(cls);
        _start();
        String uniqueKey = UUIDTools.getUUID();
        for (int i = 0; i < count; i++) {
            jedis.get().lset(key, start + i, uniqueKey);
        }
        jedis.get().lrem(key, 0, uniqueKey);
        _end();
        return count;
    }

    /**
     * List Pop，获取数组中从头部开始的count个元素，并从原数组中删除。
     *
     * @param cls
     * @param count
     * @param <T>
     * @return pop出的元素。
     */
    public <T> List<T> lpop(@Nonnull Class<T> cls, long count) {
        checkList(cls);
        String key = getListKey(cls);
        return _lpop(cls, key, count);
    }

    public <T> List<T> lpop(@Nonnull Class<T> cls, @Nonnull Date timestamp, @Nonnull long count) {
        checkList(cls);
        String key = getListKey(cls, timestamp);
        return _lpop(cls, key, count);
    }

    public <T> List<T> lpop(@Nonnull Class<T> cls, @Nonnull String key, @Nonnull long count) {
        checkList(cls);
        String listKey = getListKey(cls, key);
        return _lpop(cls, listKey, count);
    }

    private <T> List<T> _lpop(@Nonnull Class<T> cls, String key, long count) {
        checkList(cls);
        List<T> result = Lists.newArrayList();
        _start();
        for (int i = 0; i < count; i++) {
            String value = jedis.get().lpop(key);
            if (Strings.isNullOrEmpty(value)) {
                break;
            }
            result.add(JSON.parseObject(value, cls));
        }
        _end();
        return result;
    }

    /**
     * List Pop，从数组中获取头部的元素，并从原数组中删除。
     *
     * @param cls
     * @param <T>
     * @return pop出的元素。
     */
    public <T> T lpop(@Nonnull Class<T> cls) {
        checkList(cls);
        String key = getListKey(cls);
        return _lpop(cls, key);
    }

    public <T> T lpop(@Nonnull Class<T> cls, @Nonnull Date timestamp) {
        checkList(cls);
        String key = getListKey(cls, timestamp);
        return _lpop(cls, key);
    }

    public <T> T lpop(@Nonnull Class<T> cls, @Nonnull String key) {
        checkList(cls);
        String listKey = getListKey(cls, key);
        return _lpop(cls, listKey);
    }

    private <T> T _lpop(@Nonnull Class<T> cls, String key) {
        checkList(cls);
        _start();
        String value = jedis.get().lpop(key);
        T obj = null;
        if (StringUtils.isNotBlank(value)) {
            obj = JSON.parseObject(value, cls);
        }
        _end();
        return obj;
    }

    public <T> Long ldel(@Nonnull Class<T> cls, @Nonnull Date timestamp) {
        checkList(cls);
        String key = getListKey(cls, timestamp);
        return _ldel(key);
    }

    public <T> Long ldel(@Nonnull Class<T> cls, @Nonnull String key) {
        checkList(cls);
        String listKey = getListKey(cls, key);
        return _ldel(listKey);
    }

    public <T> Long ldel(@Nonnull Class<T> cls) {
        checkList(cls);
        String key = getListKey(cls);
        return _ldel(key);
    }

    private Long _ldel(String key) {
        _start();
        Long count = jedis.get().del(key);
        _end();
        return count;
    }

    private <T> String getListKey(@Nonnull Class<T> cls, Date timestamp) {
        return getListKey(cls, timestamp == null ? null : Long.toString(timestamp.getTime()));
    }

    private <T> String getListKey(Class<T> cls, String key) {
        final String LIST_PREFIX = "list:";
        String listKey = cls.getName().replace(".", ":");
        return LIST_PREFIX + (Strings.isNullOrEmpty(key) ? listKey : listKey + ":" + key);
    }

    private <T> String getListKey(@Nonnull Class<T> cls) {
        return getListKey(cls, (String) null);
    }
    /** -------------------------------------------- For Lists End ------------------------------------------------- **/

    /**
     * ------------------------------------------ For Counters Start ----------------------------------------------
     */
    private <T> void checkCounter(@Nonnull Class<T> cls) {
        if (cls.getAnnotation(RedisCounter.class) == null) {
            throw new RuntimeException("此Class必须增加RedisCounter注解");
        }
    }

    /**
     * 根据传进来的Class校验当前Class有没有加RedisCounter注解
     *
     * @param cls
     * @param <T>
     */
    private <T> String getCounterKey(@Nonnull Class<T> cls, Date timestamp, String key) {
        final String COUNTER_PREFIX = "counter:";
        StringBuilder sb = new StringBuilder(cls.getName().replace(".", ":"));
        sb.append(":timestamp#").append(timestamp == null ? "" : timestamp.getTime());
        sb.append(":key#").append(key == null ? "" : encodeKey(key.trim()));
        return COUNTER_PREFIX + sb.toString();
    }

    private String encodeKey(@Nonnull String key) {
        try {
            return URLEncoder.encode(key, Charsets.UTF_8.toString());
        } catch (UnsupportedEncodingException e) {
            logger.error("Encoding error: {}.", e.getMessage());
            throw new RuntimeException("Key encoding error: " + key);
        }
    }

    private String decode(@Nonnull String key) {
        try {
            return URLDecoder.decode(key, Charsets.UTF_8.toString());
        } catch (UnsupportedEncodingException e) {
            logger.error("Decode error: {}.", e.getMessage());
            throw new RuntimeException("Key decoding error: " + key);
        }
    }

    private <T> String getCounterKey(@Nonnull Class<T> cls) {
        return getCounterKey(cls, null, null);
    }

    /**
     * Counter Increase，统计cls给定的counter下，在timestamp给定的时间点，key的计数器增加1。如果给定key对应的定时器不存在，则会
     * 自动生成。
     *
     * @param counterClass
     * @param timestamp
     * @param key
     * @param <T>
     * @return 返回增加之后的值。
     */
    public <T> Long cincrease(@Nonnull Class<T> counterClass, @Nonnull Date timestamp, @Nonnull String key) {
        // 1. counterClass:timestamp为key，创建一个set，set中保存一个key为counterClass:timestamp:key的Counter。
        // Map<counterClass:timestamp, Set<counterClass:timestamp:key>>
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, timestamp, key);
        String indexKey = getSetKey(counterClass, timestamp);
        _start();
        jedis.get().sadd(indexKey, counterKey);
        Long count = jedis.get().incr(counterKey);
        _end();
        return count;
    }

    public <T> Long cincrease(@Nonnull Class<T> counterClass, @Nonnull String key) {
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, null, key);
        _start();
        Long count = jedis.get().incr(counterKey);
        _end();
        return count;
    }

    public <T> Long cincreaseBy(@Nonnull Class<T> counterClass, @Nonnull String key, Long step) {
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, null, key);
        _start();
        Long count = jedis.get().incrBy(counterKey, step);
        _end();
        return count;
    }

    /**
     * Counter Decrease，统计cls给定的counter下，在timestamp给定的时间点，key的计数器增加1。如果给定key对应的定时器不存在，则会
     * 自动生成。
     *
     * @param counterClass
     * @param timestamp
     * @param key
     * @param <T>
     * @return 返回增加之后的值。
     */
    public <T> Long cdecrease(@Nonnull Class<T> counterClass, @Nonnull Date timestamp, @Nonnull String key) {
        // 1. counterClass:timestamp为key，创建一个set，set中保存一个key为counterClass:timestamp:key的Counter。
        // Map<counterClass:timestamp, Set<counterClass:timestamp:key>>
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, timestamp, key);
        String indexKey = getSetKey(counterClass, timestamp);
        _start();
        jedis.get().sadd(indexKey, counterKey);
        Long count = jedis.get().decr(counterKey);
        _end();
        return count;
    }

    public <T> Long cdecrease(@Nonnull Class<T> counterClass, @Nonnull String key) {
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, null, key);
        _start();
        Long count = jedis.get().decr(counterKey);
        _end();
        return count;
    }

    /**
     * Counter Clear，清除给定的计数器。
     *
     * @param counterClass
     * @param timestamp
     * @param key
     * @param <T>
     * @return 如果该key存在，返回1，否则返回0。
     */
    public <T> Long cclear(@Nonnull Class<T> counterClass, @Nonnull Date timestamp, @Nonnull String key) {
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, timestamp, key);
        _start();
        Long count = jedis.get().del(counterKey);
        _end();
        return count;
    }

    public <T> Long cclear(@Nonnull Class<T> counterClass, @Nonnull String key) {
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, null, key);
        _start();
        Long count = jedis.get().del(counterKey);
        _end();
        return count;
    }

    /**
     * Counter Clear All，清除给定时间戳内的所有计数器。
     *
     * @param counterClass
     * @param timestamp
     * @param <T>
     * @return 被清理的计数器个数
     */
    public <T> Long cclearAll(@Nonnull Class<T> counterClass, @Nonnull Date timestamp) {
        checkCounter(counterClass);
        String indexKey = getSetKey(counterClass, timestamp);
        _start();
        Set<String> stringSet = jedis.get().smembers(indexKey);
        String[] members = new String[stringSet.size()];
        members = stringSet.toArray(members);
        Long count = jedis.get().del(members);
        jedis.get().del(indexKey);
        _end();
        return count;
    }

    /**
     * 不应该根据Classname清空所有的Counter。
     *
     * @param counterClass
     * @param <T>
     * @return
     */
    @Deprecated
    public <T> Long cclearAll(@Nonnull Class<T> counterClass) {
        throw new RuntimeException("You should not clear a counter only by class name.");
    }

    /**
     * Counter Reset，将给定的计数器置为0.
     *
     * @param counterClass
     * @param timestamp
     * @param key
     * @param <T>
     */
    public <T> void creset(@Nonnull Class<T> counterClass, @Nonnull Date timestamp, @Nonnull String key) {
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, timestamp, key);
        set(counterKey, 0l);
    }

    public <T> void creset(@Nonnull Class<T> counterClass, @Nonnull String key) {
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, null, key);
        set(counterKey, 0l);
    }

    /**
     * Counter Get All，获取所有给定时间戳的计数器。
     *
     * @param counterClass
     * @param timestamp
     * @param <T>
     * @return 返回所有的定时器。
     */
    public <T> Map<String, Long> cgetAll(@Nonnull Class<T> counterClass, @Nonnull Date timestamp) {
        checkCounter(counterClass);
        Map<String, Long> countMap = Maps.newHashMap();
        String indexKey = getSetKey(counterClass, timestamp);
        _start();
        Set<String> set = jedis.get().smembers(indexKey);
        for (String counterKey : set) {
            Long count = get(counterKey) == null ? 0l : Long.parseLong(get(counterKey));
            countMap.put(decode(counterKey.substring(counterKey.lastIndexOf(":") + 1)), count);
        }
        _end();
        return countMap;
    }

    public <T> Map<String, Long> cgetAll(@Nonnull Class<T> counterClass) {
        throw new RuntimeException("You should not get All a counter only by class name.");
//        checkCounter(counterClass);
//        _start();
//        Map<String, Long> countMap = Maps.newHashMap();
//        String indexKey = getCounterKey(counterClass, null, null);
//        Set<String> set = jedis.get().smembers(indexKey);
//        for (String counterKey : set) {
//            Long count = get(counterKey) == null ? 0l : Long.parseLong(get(counterKey));
//            countMap.put(decode(counterKey.substring(counterKey.lastIndexOf(":") + 1)), count);
//        }
//        _end();
//        return countMap;
    }

    /**
     * 获取指定Key的Counter
     *
     * @param counterClass
     * @param timestamp
     * @param key
     * @param <T>
     * @return
     */
    public <T> Long cget(@Nonnull Class<T> counterClass, @Nonnull Date timestamp, @Nonnull String key) {
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, timestamp, key);
        _start();
        Long count = get(counterKey) == null ? 0l : Long.parseLong(get(counterKey));
        _end();
        return count;
    }

    public <T> Long cget(@Nonnull Class<T> counterClass, @Nonnull String key) {
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, null, key);
        _start();
        Long count = get(counterKey) == null ? 0l : Long.parseLong(get(counterKey));
        _end();
        return count;
    }

    public <T> Long cset(@Nonnull Class<T> counterClass, @Nonnull Date timestamp, @Nonnull String key, @Nonnull Long count) {
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, timestamp, key);
        set(counterKey, count);
        return count;
    }

    public <T> Long cset(@Nonnull Class<T> counterClass, @Nonnull String key, @Nonnull Long count) {
        checkCounter(counterClass);
        String counterKey = getCounterKey(counterClass, null, key);
        set(counterKey, count);
        return count;
    }

    /**
     * ------------------------------------------- For Counters End ------------------------------------------------*
     */

    /**
     * ------------------------------------------ For Set Start ----------------------------------------------
     */

    private static final String SET_PREFIX = "set:";

    private <T> void checkSet(@Nonnull Class<T> cls) {
        if (cls.getAnnotation(RedisSet.class) == null) {
            throw new RuntimeException("此Class必须增加RedisSet注解");
        }
    }

    private <T> String getSetKey(@Nonnull Class<T> cls, Date timestamp) {
        return SET_PREFIX + cls.getName().replace(".", ":") + ":timestamp#" + (timestamp == null ? "" : timestamp.getTime());
    }

    private <T> String getSetKey(@Nonnull Class<T> cls) {
        return SET_PREFIX + cls.getName().replace(".", ":");
    }

    private <T> String getSetKey(@Nonnull Class<T> cls, String key) {
        return SET_PREFIX + cls.getName().replace(".", ":") + ":key#" + (key == null ? "" : encodeKey(key.trim()));
    }

    /**
     * List add. 将给定的元素加入到T.class为key里。
     *
     * @param objects
     * @param timestamp
     * @param <T>
     * @return 返回所有的定时器。
     */
    public <T> Long sadd(@Nonnull Date timestamp, @Nonnull T... objects) {
        return sadd(timestamp, Lists.newArrayList(objects));
    }

    public <T> Long sadd(@Nonnull Date timestamp, @Nonnull T object) {
        return sadd(timestamp, Lists.newArrayList(object));
    }

    public <T> Long sadd(@Nonnull Date timestamp, @Nonnull Collection<T> objects) {
        if (objects.isEmpty()) {
            return null;
        }
        String key = getSetKey(objects.iterator().next().getClass(), timestamp);
        return sadd(objects, key);
    }

    public <T> Long sadd(@Nonnull T object) {
        return sadd(Lists.newArrayList(object));
    }

    public <T> Long sadd(@Nonnull T... objects) {
        return sadd(Lists.newArrayList(objects));
    }

    public <T> Long sadd(@Nonnull Collection<T> objects) {
        if (objects.isEmpty()) {
            return null;
        }
        String key = getSetKey(objects.iterator().next().getClass());
        return sadd(objects, key);
    }

    private <T> Long sadd(@Nonnull Collection<T> objects, String key) {
        checkSet(objects.iterator().next().getClass());
        List<String> stringList = objects.stream().map(JSON::toJSONString).collect(Collectors.toList());
        String[] members = new String[stringList.size()];
        members = stringList.toArray(members);
        _start();
        Long count = jedis.get().sadd(key, members);
        _end();
        return count;
    }

    public <T> Long sadd(@Nonnull String key, @Nonnull T... objects) {
        return sadd(key, Lists.newArrayList(objects));
    }

    public <T> Long sadd(@Nonnull String key, @Nonnull T object) {
        return sadd(key, Lists.newArrayList(object));
    }

    public <T> Long sadd(@Nonnull String key, @Nonnull Collection<T> objects) {
        if (objects.isEmpty()) {
            return null;
        }
        String setKey = getSetKey(objects.iterator().next().getClass(), key);
        return sadd(objects, setKey);
    }


    public <T> Set<T> sget(@Nonnull Class<T> cls, @Nonnull Date timestamp) {
        String key = getSetKey(cls, timestamp);
        return _sget(cls, key);
    }

    public <T> Set<T> sget(@Nonnull Class<T> cls, @Nonnull String key) {
        String setKey = getSetKey(cls, key);
        return _sget(cls, setKey);
    }

    public <T> Set<T> sget(@Nonnull Class<T> cls) {
        String key = getSetKey(cls);
        return _sget(cls, key);
    }

    private <T> Set<T> _sget(@Nonnull Class<T> cls, String key) {
        checkSet(cls);
        _start();
        Set<String> set = jedis.get().smembers(key);
        _end();
        return set.stream().map(value -> {
            T obj = JSON.parseObject(value, cls);
            return obj;
        }).collect(Collectors.toSet());
    }

    public <T> Long sclear(@Nonnull Class<T> cls, @Nonnull Date timestamp) {
        checkSet(cls);
        String key = getSetKey(cls, timestamp);
        return sclear(key);
    }

    public <T> Long sclear(@Nonnull Class<T> cls, @Nonnull String key) {
        checkSet(cls);
        String setKey = getSetKey(cls, key);
        return sclear(setKey);
    }

    public <T> Long sclear(@Nonnull Class<T> cls) {
        checkSet(cls);
        String key = getSetKey(cls);
        return sclear(key);
    }

    private Long sclear(String key) {
        _start();
        Long count = jedis.get().del(key);
        _end();
        return count;
    }

    public <T> Long srem(@Nonnull Date timestamp, @Nonnull T object) {
        return srem(timestamp, Lists.newArrayList(object));
    }

    public <T> Long srem(@Nonnull Date timestamp, @Nonnull T... objects) {
        return srem(timestamp, Lists.newArrayList(objects));
    }

    public <T> Long srem(@Nonnull Date timestamp, @Nonnull Collection<T> objects) {
        if (objects.isEmpty()) {
            return null;
        }
        String key = getSetKey(objects.iterator().next().getClass(), timestamp);
        return srem(objects, key);
    }

    public <T> Long srem(@Nonnull String key, @Nonnull T object) {
        return srem(key, Lists.newArrayList(object));
    }

    public <T> Long srem(@Nonnull String key, @Nonnull T... objects) {
        return srem(key, Lists.newArrayList(objects));
    }

    public <T> Long srem(@Nonnull String key, @Nonnull Collection<T> objects) {
        if (objects.isEmpty()) {
            return null;
        }
        String setKey = getSetKey(objects.iterator().next().getClass(), key);
        return srem(objects, setKey);
    }

    public <T> Long srem(@Nonnull T object) {
        return srem(Lists.newArrayList(object));
    }

    public <T> Long srem(@Nonnull T... objects) {
        return srem(Lists.newArrayList(objects));
    }

    public <T> Long srem(@Nonnull Collection<T> objects) {
        String key = getSetKey(objects.iterator().next().getClass());
        return srem(objects, key);
    }

    private <T> Long srem(@Nonnull Collection<T> objects, String key) {
        checkSet(objects.iterator().next().getClass());
        _start();
        List<String> stringList = objects.stream().map(JSON::toJSONString).collect(Collectors.toList());
        String[] members = new String[stringList.size()];
        members = stringList.toArray(members);
        Long count = jedis.get().srem(key, members);
        _end();
        return count;
    }

    public <T> Boolean sismember(@Nonnull String key, @Nonnull T object) {
        String setKey = getSetKey(object.getClass(), key);
        return _sismember(setKey, object);
    }

    public <T> Boolean sismember(@Nonnull Date timestamp, @Nonnull T object) {
        String setKey = getSetKey(object.getClass(), timestamp);
        return _sismember(setKey, object);
    }

    private <T> Boolean _sismember(@Nonnull String key, @Nonnull T object) {
        checkSet(object.getClass());
        _start();
        Boolean flag = jedis.get().sismember(key, JSON.toJSONString(object));
        _end();
        return flag;
    }

    /**
     * ------------------------------------------- For Set End ------------------------------------------------*
     */

    /**
     * ------------------------------------------- For Lock Start ------------------------------------------------*
     */

    private static final String LOCK_PREFIX = "lock:";

    private final ThreadLocal<String> lockId = new ThreadLocal<>();

    public void tryLock(@Nonnull Class<?> lockClass, @Nonnull String lock) {
        String lockKey = getLockKey(lockClass, lock);
        String uuid = UUIDTools.getUUID();
        _start();
        while (jedis.get().setnx(lockKey, uuid) == 0) {
            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                logger.warn("Interrupted sleep: " + e.getMessage());
            }
        }
        lockId.set(uuid);
        jedis.get().expire(lockKey, 10);
        _end();
    }

    public void unlock(@Nonnull Class<?> lockClass, @Nonnull String lock) {
        String lockKey = getLockKey(lockClass, lock);
        _start();
        String uuid = jedis.get().get(lockKey);
        // 如果是同一把锁，才释放。
        if (uuid != null && uuid.equals(lockId.get())) {
            jedis.get().del(lockKey);
            lockId.remove();
        }
        _end();
    }

    private String getLockKey(@Nonnull Class<?> lockClass, @Nonnull String lock) {
        return LOCK_PREFIX + lockClass.getName().replace(".", ":") + ":" + lock;
    }
}
