package com.a.persona.infra.config;

import feign.Request.Options;
import feign.RequestInterceptor;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class FeignConfig {

    @Bean
    public Options requestOptions(){
        return new Options(5, TimeUnit.SECONDS, 5, TimeUnit.MINUTES, true);
    }

    @Bean
    public RequestInterceptor requestInterceptor(){
        return requestTemplate -> {
            log.info("requestTemplate : {}", requestTemplate);
        };
    }

}
