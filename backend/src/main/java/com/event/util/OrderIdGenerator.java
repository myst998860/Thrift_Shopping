package com.event.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class OrderIdGenerator {
    
    private static final Random RANDOM = new Random();
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    
    public static String generate() {
        String datePart = LocalDateTime.now().format(DATE_FORMATTER);
        String randomPart = getRandomString(4);
        return "ORD" + datePart + randomPart;
    }
    
    private static String getRandomString(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}