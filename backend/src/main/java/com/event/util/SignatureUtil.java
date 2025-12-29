package com.event.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class SignatureUtil {
    
    private static String merchantSecret;
    
    @Value("${esewa.merchant.secret}")
    public void setMerchantSecret(String secret) {
        merchantSecret = secret;
    }
    
    public static String generateSignature(String message) {
        try {
            System.out.println("Generating signature for message: " + message);
            System.out.println("Using secret key: " + merchantSecret);
            
            if (merchantSecret == null || merchantSecret.isEmpty()) {
                throw new RuntimeException("Merchant secret is not configured");
            }
            
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                merchantSecret.getBytes(StandardCharsets.UTF_8), 
                "HmacSHA256"
            );
            sha256_HMAC.init(secretKeySpec);
            
            byte[] hash = sha256_HMAC.doFinal(message.getBytes(StandardCharsets.UTF_8));
            String signature = Base64.getEncoder().encodeToString(hash);
            
            System.out.println("Generated signature: " + signature);
            return signature;
        } catch (Exception e) {
            System.err.println("Error generating signature: " + e.getMessage());
            throw new RuntimeException("Failed to generate eSewa signature", e);
        }
    }
    
    // Alternative method for specific parameter order
    public static String generateEsewaSignature(String totalAmount, String transactionUuid, String productCode) {
        String message = String.format("total_amount=%s,transaction_uuid=%s,product_code=%s",
                totalAmount, transactionUuid, productCode);
        return generateSignature(message);
    }
}