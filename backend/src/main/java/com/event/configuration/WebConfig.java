package com.event.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry
          .addMapping("/**")
          .allowedOrigins("http://localhost:3000")
          .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
          .allowedHeaders("*")
          .allowCredentials(true);
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(
                "/images/**", "/js/**", "/css/**", "/svg/**")
            .addResourceLocations(
                "classpath:/static/images/",
                "classpath:/static/js/",
                "classpath:/static/css/",
                "classpath:/static/svg/")
            .setCachePeriod(3600);
    }
}
