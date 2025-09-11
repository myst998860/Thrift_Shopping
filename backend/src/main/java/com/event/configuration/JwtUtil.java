package com.event.configuration;

import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;

@Component
public class JwtUtil {

	
	@Value("${jwt.secret}")
    private String base64Key;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(base64Key);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours

    public String generateToken(String email, String role, Long userId) {
        String jti = UUID.randomUUID().toString();
        return Jwts.builder()
          .setSubject(email)
          .claim("role", role)
          .claim("userId", userId)
          .setId(jti)
          .setIssuedAt(new Date())
          .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
          .signWith(getSigningKey(), SignatureAlgorithm.HS256)
          .compact();
    }
    
    
    public String getJti(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey())
          .build().parseClaimsJws(token).getBody().getId();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public String getRoleFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }
}