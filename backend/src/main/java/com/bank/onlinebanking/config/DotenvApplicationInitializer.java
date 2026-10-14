package com.bank.onlinebanking.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;
import org.springframework.lang.NonNull;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class DotenvApplicationInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Logger logger = LoggerFactory.getLogger(DotenvApplicationInitializer.class);

    @Override
    public void initialize(@NonNull ConfigurableApplicationContext applicationContext) {
        File[] candidatePaths = new File[] {
                new File(".env"),
                new File("../.env"),
                new File("backend/.env"),
                new File("../../.env")
        };

        File envFile = null;
        for (File candidate : candidatePaths) {
            if (candidate.exists() && candidate.isFile()) {
                envFile = candidate;
                break;
            }
        }

        if (envFile == null) {
            return;
        }

        Map<String, Object> envProperties = new HashMap<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                    continue;
                }
                int idx = line.indexOf('=');
                String key = line.substring(0, idx).trim();
                String val = line.substring(idx + 1).trim();

                // Strip optional quotes
                if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                    if (val.length() >= 2) {
                        val = val.substring(1, val.length() - 1);
                    }
                }

                if (!key.isEmpty()) {
                    envProperties.put(key, val);

                    // Map datasource keys if not default placeholder
                    if ("DB_PASSWORD".equals(key) && !val.equals("your_mysql_password_here") && !val.isEmpty()) {
                        envProperties.put("spring.datasource.password", val);
                    }
                    if ("DB_USERNAME".equals(key) && !val.isEmpty()) {
                        envProperties.put("spring.datasource.username", val);
                    }
                    if ("DB_URL".equals(key) && !val.isEmpty()) {
                        envProperties.put("spring.datasource.url", val);
                    }
                }
            }

            if (!envProperties.isEmpty()) {
                // Add with lower priority than system environment / JVM properties
                // but higher than application.properties
                applicationContext.getEnvironment().getPropertySources()
                        .addLast(new MapPropertySource("dotenvProperties", envProperties));
                logger.info("Configured environment properties from {}", envFile.getCanonicalPath());
            }
        } catch (IOException e) {
            logger.warn("Could not read .env file from {}: {}", envFile.getAbsolutePath(), e.getMessage());
        }
    }
}
