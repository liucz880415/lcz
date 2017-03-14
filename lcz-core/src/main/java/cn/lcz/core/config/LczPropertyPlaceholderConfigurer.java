package cn.lcz.core.config;

import com.google.common.base.Charsets;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.File;
import java.util.List;

public class LczPropertyPlaceholderConfigurer extends PropertyPlaceholderConfigurer implements
        InitializingBean {
    private static final Logger logger = LoggerFactory.getLogger(LczPropertyPlaceholderConfigurer.class);
    private String baseDir;
    private String suffix;

    public LczPropertyPlaceholderConfigurer() {
        // 默认优先读取环境变量
        super.setSystemPropertiesMode(SYSTEM_PROPERTIES_MODE_OVERRIDE);
        super.setSearchSystemEnvironment(true);
        super.setIgnoreResourceNotFound(true);
        super.setIgnoreUnresolvablePlaceholders(true);
        super.setFileEncoding(Charsets.UTF_8.toString());
    }

    @Override
    public void setLocations(Resource... locations) {
        throw new UnsupportedOperationException("Please use xxx instead.");
    }

    public String getBaseDir() {
        return baseDir;
    }

    public void setBaseDir(String baseDir) {
        this.baseDir = baseDir;
    }

    public String getSuffix() {
        return suffix;
    }

    public void setSuffix(String suffix) {
        this.suffix = suffix;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        super.setLocations(getResources());
    }

    private Resource[] getResources() {
        File rootDir = File.listRoots()[0];
        File propertyDir = new File(rootDir.getAbsolutePath() + baseDir);
        File[] files = propertyDir.listFiles(pathname -> {
            return pathname.getName().endsWith(suffix);
        });

        if (files == null || files.length == 0) {
            logger.error("No properties file found in directory: {}.", propertyDir);
            throw new RuntimeException("No properties file found in directory: " + propertyDir);
        }

        List<Resource> resources = Lists.newArrayList();
        for (File file : files) {
            logger.info("Loading properties file: [{}].", file.getPath());
            resources.add(new FileSystemResource(file));
        }
        Resource[] locations = new Resource[resources.size()];
        resources.toArray(locations);
        return locations;
    }
}
