package cn.lcz.core.utils;

import com.alibaba.fastjson.JSON;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.*;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;

import javax.annotation.Nonnull;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;
import java.util.List;


public class HttpClientUtil {

    public static final String CHARSET = "UTF-8";
    private final static PoolingHttpClientConnectionManager poolingHttpClientConnectionManager;
    private final static CloseableHttpClient httpClient;

    static {
        poolingHttpClientConnectionManager = new PoolingHttpClientConnectionManager();
        poolingHttpClientConnectionManager.setMaxTotal(200);
        poolingHttpClientConnectionManager.setDefaultMaxPerRoute(20);
        RequestConfig requestConfig = RequestConfig.custom().setConnectionRequestTimeout(20000).setConnectTimeout(20000).setSocketTimeout(3600000).build();
        httpClient = HttpClients.custom().setDefaultRequestConfig(requestConfig).setConnectionManager(poolingHttpClientConnectionManager).setConnectionManagerShared(true).build();
    }

    public static String post(String url) {
        HttpPost http = new HttpPost(url);

        http.setHeader("accept", "*/*");
        http.setHeader("connection", "Keep-Alive");
        http.setHeader("user-web", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
        http.setHeader("Content-type", ContentType.DEFAULT_TEXT.toString());
        return call(http);
    }

    public static <T> T post(String url, Class<T> clazz) {
        String responseJson = post(url);
        if (StringUtils.isBlank(responseJson)) {
            return null;
        }
        return JSON.parseObject(responseJson, clazz);
    }

    public static String post(String url, List<NameValuePair> nameValuePairs) {
        HttpPost http = new HttpPost(url);
        try {
            http.setEntity(new UrlEncodedFormEntity(nameValuePairs, CHARSET));
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
        return call(http);
    }

    public static <T> T post(String url, List<NameValuePair> nameValuePairs, Class<T> clazz) {
        String responseJson = post(url, nameValuePairs);
        if (StringUtils.isBlank(responseJson)) {
            return null;
        }
        return JSON.parseObject(responseJson, clazz);
    }

    public static String post(String url, String json) {
        HttpPost http = new HttpPost(url);
        if (StringUtils.isNotBlank(json)) {
            StringEntity strEntity = new StringEntity(json, Charset.forName(CHARSET));
            strEntity.setContentType("application/json");
            http.setEntity(strEntity);
        }
        return call(http);
    }

    public static <T> T post(String url, String json, Class<T> clazz) {
        String responseJson = post(url, json);
        if (StringUtils.isBlank(responseJson)) {
            return null;
        }
        return JSON.parseObject(responseJson, clazz);
    }

    public static String post(String url, @Nonnull byte[] data, int length) {
        HttpPost http = new HttpPost(url);
        if (length > 0) {
            ByteArrayEntity byteArrayEntity = new ByteArrayEntity(data, 0, length, ContentType.APPLICATION_FORM_URLENCODED);
            http.setEntity(byteArrayEntity);
        }

        http.setHeader("accept", "*/*");
        http.setHeader("connection", "Keep-Alive");
        http.setHeader("user-web", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
        http.setHeader("Content-type", "application/x-www-form-urlencoded");
        return call(http);
    }

    public static <T> T post(String url, @Nonnull byte[] data, int length, Class<T> clazz) {
        String responseJson = post(url, data, length);
        if (StringUtils.isBlank(responseJson)) {
            return null;
        }
        return JSON.parseObject(responseJson, clazz);
    }

    public static String get(String url) {
        HttpGet http = new HttpGet(url);
        return call(http);
    }

    public static <T> T get(String url, Class<T> clazz) {
        String responseJson = get(url);
        if (StringUtils.isBlank(responseJson)) {
            return null;
        }
        return JSON.parseObject(responseJson, clazz);
    }

    public static <T> List<T> getList(String url, Class<T> clazz) {
        String responseJson = get(url);
        if (StringUtils.isBlank(responseJson)) {
            return null;
        }
        return JSON.parseArray(responseJson, clazz);
    }

    public static String delete(String url) {
        HttpDelete http = new HttpDelete(url);

        http.setHeader("accept", "*/*");
        http.setHeader("connection", "Keep-Alive");
        http.setHeader("user-web", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
        http.setHeader("Content-type", ContentType.DEFAULT_TEXT.toString());
        return call(http);
    }

    public static <T> T delete(String url, Class<T> clazz) {
        String responseJson = delete(url);
        if (StringUtils.isBlank(responseJson)) {
            return null;
        }
        return JSON.parseObject(responseJson, clazz);
    }

    private static String call(HttpRequestBase request) {
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
                HttpEntity responseEntity = response.getEntity();
                StringBuilder stringBuilder = new StringBuilder();
                if (responseEntity != null) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(responseEntity.getContent(), CHARSET));
                    String temp;
                    while ((temp = reader.readLine()) != null) {
                        stringBuilder.append(temp);
                    }
                    reader.close();
                }
                return stringBuilder.toString();
            }

            if (response.getEntity() != null) {
                String errorMessage = new BufferedReader(new InputStreamReader(response.getEntity().getContent(), CHARSET)).readLine();
                throw new RuntimeException("<br/> 接收数据错误：URI ==> " + request.getURI() + "<br/> ERROR ==> " + errorMessage + "<br/>");
            }
            throw new RuntimeException("<br/> 接收数据错误！URI ==> " + request.getURI() + "<br/>");
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            request.releaseConnection();
        }
    }
}