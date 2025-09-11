package com.event.controller;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.event.repository.RefreshTokenRepo;
import com.event.repository.UserRepo;

import jakarta.servlet.http.HttpServletRequest;

import com.event.configuration.JwtUtil;
import com.event.dto.LoginRequest;
import com.event.dto.SignupRequest;
import com.event.model.Admin;
import com.event.model.Attendee;
import com.event.model.Partner;
import com.event.model.RefreshToken;
import com.event.model.User;


@RestController
@RequestMapping("/auth") 
public class SignupController {
	
	@Autowired
	private UserRepo uRepo;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	 @Autowired
	 private BCryptPasswordEncoder passwordEncoder;
	 
	 @Autowired
	 private JavaMailSender mailSender;
	 
	 @Autowired
	 private RefreshTokenRepo refreshTokenRepo;

	  private final int OTP_VALID_DURATION_MINUTES = 10;
	

	@PostMapping("signup")
	public ResponseEntity<?> register(@RequestBody @Validated SignupRequest signupRequest) {
	    try {
	        User user;
	        switch (signupRequest.getRole().toUpperCase()) {
	            case "ADMIN": 
	                user = new Admin();
	                break;
	            case "PARTNER":
	                user = new Partner();
	                break;
	            case "ATTENDEE":
	                user = new Attendee();
	                break;
	            default:
	                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid role");
	        }

	        user.setEmail(signupRequest.getEmail());
	        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
	        user.setRole(signupRequest.getRole());
	        user.setPhoneNumber(signupRequest.getPhoneNumber());
	        user.setFullname(signupRequest.getFullname());
	        user.setBusinessTranscripts(signupRequest.getBusinessTranscripts());
	        user.setPanCard(signupRequest.getPanCard());
	        user.setCompany(signupRequest.getCompany());
	        user.setJoinDate(LocalDateTime.now()); 
	        user.setStatus(signupRequest.getStatus());
	      
	        if (uRepo.findByEmail(user.getEmail()).isPresent()) {
	            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already registered");
	        }
	        
	        uRepo.save(user);
	        return ResponseEntity.ok("User registered successfully");
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed");
	    }
	}


	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody @Validated LoginRequest loginRequest) {
	    try {
	        User existingUser = uRepo.findByEmail(loginRequest.getEmail())
	                                 .orElseThrow(() -> new RuntimeException("User not found"));

	        if (!passwordEncoder.matches(loginRequest.getPassword(), existingUser.getPassword())) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	                                 .body("Invalid username or password");
	        }
	        
	        if ("partner".equalsIgnoreCase(existingUser.getRole()) && "pending".equalsIgnoreCase(existingUser.getStatus())) {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                                 .body("Partner account is pending approval. Please wait for approval.");
	        }

	        String role = existingUser.getRole();
	        String accessToken = jwtUtil.generateToken(existingUser.getEmail(), role, existingUser.getUser_id());

	        // Inline redirect URL logic (replaces missing method)
	        String redirectUrl;
	        switch (role.toLowerCase()) {
	            case "admin"    -> redirectUrl = "/admin/dashboard";
	            case "partner"  -> redirectUrl = "/partner/dashboard";
	            case "attendee" -> redirectUrl = "/home";
	            default         -> redirectUrl = "/";
	        }

	        // Refresh token handling
	        refreshTokenRepo.deleteById(existingUser.getUser_id());

	        // Create new refresh token tied to session
	        String sessionId = UUID.randomUUID().toString();
	        String jti = jwtUtil.getJti(accessToken);

	        RefreshToken rt = new RefreshToken();
	        rt.setUser(existingUser);
	        rt.setToken(UUID.randomUUID().toString());
	        rt.setSessionId(sessionId);
	        rt.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
	        rt.setJti(jti);
	        refreshTokenRepo.save(rt);

	        return ResponseEntity.ok(Map.of(
	            "message",      "Login successful",
	            "token",        accessToken,
	            "refreshToken", rt.getToken(),
	            "role",         role,
	            "sessionId",    sessionId,
	            "redirect",     redirectUrl
	        ));
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                             .body("Login failed");
	    }
	}
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String jti = body.get("jti");
        String sessionId = body.get("sessionId");

        // Get stored refresh token object first by token string
        Optional<RefreshToken> optRt = refreshTokenRepo.findByToken(body.get("refreshToken"));
        if (optRt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body("Invalid or expired refresh token");
        }

        RefreshToken rt = optRt.get();
        Long userId = rt.getUser().getUser_id();

        // Now find by jti, userId and sessionId
        Optional<RefreshToken> opt = refreshTokenRepo.findByJtiAndUserUser_idAndSessionId(jti, userId, sessionId);
        
        if (opt.isEmpty() || rt.getExpiresAt().isBefore(Instant.now())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body("Invalid or expired refresh data");
        }

        User u = uRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        String newAccess = jwtUtil.generateToken(u.getEmail(), u.getRole(), u.getUser_id());
        String newJti = jwtUtil.getJti(newAccess);

        refreshTokenRepo.delete(rt);

        RefreshToken newRt = new RefreshToken();
        newRt.setUser(u);
        newRt.setSessionId(sessionId);
        newRt.setToken(UUID.randomUUID().toString());
        newRt.setJti(newJti);
        newRt.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        refreshTokenRepo.save(newRt);

        return ResponseEntity.ok(Map.of(
            "accessToken", newAccess,
            "refreshToken", newRt.getToken(),
            "jti", newJti
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body, HttpServletRequest req) {
        String jti = body.get("jti");
        String sessionId = body.get("sessionId");

        Optional<RefreshToken> optRt = refreshTokenRepo.findByToken(body.get("refreshToken"));
        optRt.ifPresent(rt -> {
            Long userId = rt.getUser().getUser_id();
            refreshTokenRepo.findByJtiAndUserUser_idAndSessionId(jti, userId, sessionId)
                            .ifPresent(refreshTokenRepo::delete);
        });

        new SecurityContextLogoutHandler().logout(req, null, null);
        return ResponseEntity.ok("Logged out successfully");
    }
	// generate OTP
	private String generateOtp() {
        Random random = new Random();
        int otpInt = 100000 + random.nextInt(900000);
        return String.valueOf(otpInt);
    }
	
	//Send OTP TO Email
	private void sendOtpEmail(String toEmail, String otp) {
	    // For testing - just log the OTP instead of sending email
//	    System.out.println("=== FAKE EMAIL SERVICE ===");
//	    System.out.println("To: " + toEmail);
//	    System.out.println("Subject: Your Password Reset OTP");
//	    System.out.println("OTP Code: " + otp);
//	    System.out.println("This OTP will expire in 10 minutes.");
//	    System.out.println("========================");
	    
	    // Uncomment this when you want to actually send emails
	    
	    SimpleMailMessage message = new SimpleMailMessage();
	    message.setTo(toEmail);
	    message.setSubject("Your Password Reset OTP");
	    message.setText("Your OTP for password reset is: " + otp + ". It will expire in 10 minutes.");
	    mailSender.send(message);
	    
	}
    //Password Reset Request
    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            User user = uRepo.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

            String otp = generateOtp();
            user.setOtpCode(otp);
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(OTP_VALID_DURATION_MINUTES));
            uRepo.save(user);

            sendOtpEmail(email, otp);

            return ResponseEntity.ok(Map.of("message", "OTP sent to email"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
        }
    }


    //verify the otp 
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        try {
            User user = uRepo.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

            if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
                throw new Exception("Invalid OTP");
            }
            if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
                throw new Exception("OTP expired");
            }

            // Clear OTP after successful verification
            user.setOtpCode(null);
            user.setOtpExpiry(null);
            uRepo.save(user);

            return ResponseEntity.ok(Map.of("message", "OTP verified"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    //reset oasswird after verify otp
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otpCode = request.get("otpCode"); // Changed from "otp" to match frontend
        String newPassword = request.get("password");
        
        try {
            User user = uRepo.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

            // Verify OTP
            if (user.getOtpCode() == null || !user.getOtpCode().equals(otpCode)) {
                throw new Exception("Invalid OTP code");
            }
            if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
                throw new Exception("OTP code has expired");
            }

            // Reset password
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            user.setPassword(encoder.encode(newPassword));

            // Clear OTP after successful reset
            user.setOtpCode(null);
            user.setOtpExpiry(null);

            uRepo.save(user);

            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
        }
    }
    
   
}

	
	
	
	

