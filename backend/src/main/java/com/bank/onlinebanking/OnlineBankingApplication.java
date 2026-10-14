package com.bank.onlinebanking;

import com.bank.onlinebanking.config.DotenvApplicationInitializer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OnlineBankingApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(OnlineBankingApplication.class);
        application.addInitializers(new DotenvApplicationInitializer());
        application.run(args);
    }
}
