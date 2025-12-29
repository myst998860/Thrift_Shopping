package com.event.service;

import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class OtpService {

    // Generate 6-digit OTP
    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // ensures 6 digits
        return String.valueOf(otp);
    }
}
