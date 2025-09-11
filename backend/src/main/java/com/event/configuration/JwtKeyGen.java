package com.event.configuration;

import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import java.security.Key;

public class JwtKeyGen {
    public static void main(String[] args) {
        Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        System.out.println(Encoders.BASE64.encode(key.getEncoded()));
    }
}
