package com.event.controller.Admin;

import com.event.dto.EsewaPaymentRequest;
import com.event.service.EsewaPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/esewa")
@CrossOrigin(origins = "http://localhost:3000")
public class EsewaController {
    
    @Autowired
    private EsewaPaymentService esewaPaymentService;
    
    @PostMapping("/initiate/{orderId}")
    public ResponseEntity<?> initiatePayment(@PathVariable Long orderId) {
        try {
            EsewaPaymentRequest paymentRequest = esewaPaymentService.initiatePayment(orderId);
            return ResponseEntity.ok(paymentRequest);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to initiate payment");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePaymentWithAmount(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = Long.parseLong(request.get("orderId").toString());
            EsewaPaymentRequest paymentRequest = esewaPaymentService.initiatePayment(orderId);
            return ResponseEntity.ok(paymentRequest);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to initiate payment");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/success")
    public ResponseEntity<String> esewaSuccess(
            @RequestParam(value = "data", required = false) String encodedData,
            @RequestParam(value = "transaction_uuid", required = false) String transactionUuid,
            @RequestParam(value = "total_amount", required = false) String totalAmount) {
        
        try {
            System.out.println("eSewa Success Callback Received");
            System.out.println("Encoded Data: " + encodedData);
            System.out.println("Transaction UUID: " + transactionUuid);
            System.out.println("Total Amount: " + totalAmount);
            
            boolean paymentVerified = false;
            
            // If encoded data is provided, decode it
            if (encodedData != null && !encodedData.isEmpty()) {
                String decodedData = new String(Base64.getDecoder().decode(encodedData));
                System.out.println("Decoded Data: " + decodedData);
                
                // Parse JSON from decoded data
                // You might want to use Jackson ObjectMapper here
            }
            
            // Verify payment if we have transaction details
            if (transactionUuid != null && totalAmount != null) {
                paymentVerified = esewaPaymentService.verifyPayment(transactionUuid, totalAmount);
            }
            
            String htmlResponse;
            if (paymentVerified) {
                htmlResponse = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Payment Successful</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                margin: 0;
                            }
                            .container {
                                background: white;
                                padding: 40px;
                                border-radius: 10px;
                                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                                text-align: center;
                            }
                            .success-icon {
                                color: #4CAF50;
                                font-size: 50px;
                                margin-bottom: 20px;
                            }
                            h1 {
                                color: #333;
                            }
                            p {
                                color: #666;
                                margin-bottom: 30px;
                            }
                            button {
                                background: #667eea;
                                color: white;
                                border: none;
                                padding: 12px 30px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-size: 16px;
                                transition: background 0.3s;
                            }
                            button:hover {
                                background: #764ba2;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="success-icon">✓</div>
                            <h1>Payment Successful!</h1>
                            <p>Thank you for your payment. Your transaction has been completed successfully.</p>
                            <button onclick="redirectToOrders()">Go to Orders</button>
                        </div>
                        <script>
                            function redirectToOrders() {
                                window.location.href = "http://localhost:3000/orders";
                            }
                            // Auto-redirect after 5 seconds
                            setTimeout(redirectToOrders, 5000);
                        </script>
                    </body>
                    </html>
                    """;
            } else {
                htmlResponse = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Payment Processing</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                background: #f5f5f5;
                            }
                            .container {
                                background: white;
                                padding: 40px;
                                border-radius: 10px;
                                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                                text-align: center;
                            }
                            .loading {
                                border: 5px solid #f3f3f3;
                                border-top: 5px solid #667eea;
                                border-radius: 50%;
                                width: 50px;
                                height: 50px;
                                animation: spin 1s linear infinite;
                                margin: 0 auto 20px;
                            }
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="loading"></div>
                            <h2>Payment Received</h2>
                            <p>Your payment has been received. Please wait while we verify the transaction.</p>
                            <p>You will be redirected shortly...</p>
                        </div>
                        <script>
                            setTimeout(function() {
                                window.location.href = "http://localhost:3000/orders";
                            }, 3000);
                        </script>
                    </body>
                    </html>
                    """;
            }
            
            return ResponseEntity.ok(htmlResponse);
            
        } catch (Exception e) {
            System.err.println("Error processing success callback: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("<h1>Error processing payment</h1><p>" + e.getMessage() + "</p>");
        }
    }
    
    @GetMapping("/failure")
    public ResponseEntity<String> esewaFailure(
            @RequestParam(value = "data", required = false) String encodedData,
            @RequestParam(value = "error", required = false) String error) {
        
        System.out.println("eSewa Failure Callback Received");
        System.out.println("Error: " + error);
        
        String htmlResponse = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Payment Failed</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                        margin: 0;
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                        text-align: center;
                    }
                    .error-icon {
                        color: #f44336;
                        font-size: 50px;
                        margin-bottom: 20px;
                    }
                    h1 {
                        color: #333;
                    }
                    p {
                        color: #666;
                        margin-bottom: 30px;
                    }
                    .button-group {
                        display: flex;
                        gap: 10px;
                        justify-content: center;
                    }
                    button {
                        padding: 12px 30px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        transition: opacity 0.3s;
                    }
                    .retry {
                        background: #f5576c;
                        color: white;
                    }
                    .home {
                        background: #667eea;
                        color: white;
                    }
                    button:hover {
                        opacity: 0.9;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="error-icon">✗</div>
                    <h1>Payment Failed</h1>
                    <p>Your payment could not be processed. Please try again.</p>
                    <div class="button-group">
                        <button class="retry" onclick="retryPayment()">Try Again</button>
                        <button class="home" onclick="goHome()">Go to Home</button>
                    </div>
                </div>
                <script>
                    function retryPayment() {
                        window.location.href = "http://localhost:3000/checkout";
                    }
                    function goHome() {
                        window.location.href = "http://localhost:3000";
                    }
                </script>
            </body>
            </html>
            """;
        
        return ResponseEntity.ok(htmlResponse);
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("eSewa Payment API is working");
    }
}