package com.event.configuration;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dwtmmrrgx");
        config.put("api_key", "144481496832882");
        config.put("api_secret", "eu0lZLoi4sOLZZigjyEyLrLBb5I");
        return new Cloudinary(config);
    }
}
