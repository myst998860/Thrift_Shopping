package com.event.configuration;


import java.util.Arrays;
import java.util.List;

import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

//CORS Configuration

@Configuration
@EnableWebSecurity
@EnableMethodSecurity

public class SecurityConfig {
	
	private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
        
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                    // Allow all GET requests for these endpoints (anonymous access)
                    .requestMatchers(HttpMethod.GET, "/venues", "/proxy/image", "/proxy/image/**","/venues/**",
                    		"/bookings/**","/bookings","/api/stats","/auth/test-email","/notiifications","/notifications/**").permitAll()
                    
                    .requestMatchers(HttpMethod.POST, "/auth/forgot-password").permitAll()
                    
                    // Allow OPTIONS for all (preflight)
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    
                    // Allow static and images folder access
                    .requestMatchers("/static/**", "/images/**").permitAll()
                    
                    // Restricted endpoints needing roles
                    .requestMatchers(HttpMethod.GET, "/profile", "/profile/**", "/api/stats", "/api/stats/**", "/venues/**","/bookings/**","/bookings")
                        .hasAnyRole("ADMIN", "ATTENDEE", "PARTNER")
                    
                    .requestMatchers("/venues/new", "/venues/add")
                        .hasAnyRole("ADMIN", "PARTNER")
                    
                    .requestMatchers("/user/**","/user-profile")
                        .hasRole("ATTENDEE")
                    
                    .requestMatchers("/admin/**")
                        .hasRole("ADMIN")
                        
                        .requestMatchers(HttpMethod.GET, "/bookings", "/bookings/**")
                        .hasRole("ADMIN") 
                    
                    // Permit auth, users, partners, bookings (if you want anonymous access)
                    .requestMatchers("/auth/**", "/users/**", "/partners/**", "/bookings/**", "/venues/add", "/venues")
                        .permitAll()
                    
                    // All other requests require authentication
                    .anyRequest().authenticated()
            		)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation(fixation -> fixation.migrateSession())
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
                .expiredUrl("/login?expired=true")
                .sessionRegistry(sessionRegistry())
            )
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    
	    @Bean
	    public CorsConfigurationSource corsConfigurationSource() {
	        CorsConfiguration config = new CorsConfiguration();
	        config.setAllowCredentials(true);
	        config.addAllowedOriginPattern("http://localhost:3000");
	        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
	        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"	));

	        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
	        source.registerCorsConfiguration("/**", config);
	        return source;
	    }

	    
	    @Bean
	    public SessionRegistry sessionRegistry() {
	        return new SessionRegistryImpl();
	    }

	    // This bean is needed to enable session concurrency events (like session destroyed)
	    @Bean
	    public static ServletListenerRegistrationBean<HttpSessionEventPublisher> httpSessionEventPublisher() {
	        return new ServletListenerRegistrationBean<>(new HttpSessionEventPublisher());
	    }
	}

