package com.smartcommerce.backend.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Orígenes permitidos
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));

        // Permisos: Permitir TODOS los headers (*)
        config.addAllowedHeader("*");

        // Permisos: Permitir TODOS los métodos
        config.addAllowedMethod("*");

        // Aplicar la configuración a todas las rutas (/**)
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
