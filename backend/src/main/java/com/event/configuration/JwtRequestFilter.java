package com.event.configuration;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtRequestFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
    	

    	
    	
        try {
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                // Skip authentication for preflight requests
                chain.doFilter(request, response);
                return;
            }

            final String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                System.out.println("[JwtRequestFilter] Token found: " + token);

                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.getEmailFromToken(token);
                    String role = jwtUtil.getRoleFromToken(token);

                    System.out.println("[JwtRequestFilter] Username from token: " + username);
                    System.out.println("[JwtRequestFilter] Role from token: " + role);
                    

                    if (username != null && role != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        List<GrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority(role.toLowerCase()),         // "admin"
                            new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()) // "ROLE_ADMIN"
                        );

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(username, null, authorities);

                        SecurityContextHolder.getContext().setAuthentication(auth);

                        System.out.println("[JwtRequestFilter] Authentication set for user: " + username);
                    
                    } else {
                        System.out.println("[JwtRequestFilter] Authentication not set: username or role null or authentication already exists");
                    }
                } else {
                    System.out.println("[JwtRequestFilter] JWT token validation failed");
                }
            } else {
                System.out.println("[JwtRequestFilter] No Bearer token found in Authorization header");
            }

            chain.doFilter(request, response);
        } catch (Exception ex) {
            // Log the error and continue filter chain or you may want to send an error response here
            System.err.println("[JwtRequestFilter] Exception in filter: " + ex.getMessage());
            chain.doFilter(request, response);
        }
    }
    
    
}