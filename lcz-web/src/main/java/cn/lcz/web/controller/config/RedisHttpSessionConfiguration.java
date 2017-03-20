package cn.lcz.web.controller.config;

import cn.lcz.config.redis.beans.RedisConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import redis.clients.jedis.JedisPoolConfig;

@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 60 * 60 * 24 * 30)
public class RedisHttpSessionConfiguration {

    @Autowired
    private RedisConfig redisConfig;

    @Bean
    public JedisConnectionFactory connectionFactory() {
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

        JedisConnectionFactory connection = new JedisConnectionFactory();
        connection.setHostName(redisConfig.getAddress());
        connection.setPort(redisConfig.getPort());
        connection.setTimeout(redisConfig.getTimeout());
        connection.setPassword(redisConfig.getAuth());
        connection.setDatabase(redisConfig.getDatabase());
        connection.setPoolConfig(jedisPoolConfig);
        return connection;
    }
}
