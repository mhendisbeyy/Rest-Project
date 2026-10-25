package com.example.restworkshop.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI workshopOpenApi() {
        return new OpenAPI().info(new Info().title("REST Atölyesi")
                .version("1.0").description("YKH yapısında görev yönetimi ve HTTP eğitim API'si"));
    }
}
