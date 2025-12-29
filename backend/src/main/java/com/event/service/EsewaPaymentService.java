package com.event.service;

import com.event.dto.EsewaPaymentRequest;
import com.event.dto.EsewaStatusResponse;
import com.event.model.Order;
import com.event.repository.OrderRepo;
import com.event.util.SignatureUtil;  // Changed import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class EsewaPaymentService {
    
    @Value("${esewa.product.code}")
    private String productCode;
    
    @Value("${esewa.success.url}")
    private String successUrl;
    
    @Value("${esewa.failure.url}")
    private String failureUrl;
    
    @Value("${esewa.gateway.url}")
    private String gatewayUrl;
    
    @Value("${esewa.verification.url}")
    private String verificationUrl;
    
    @Autowired
    private OrderRepo orderRepo;
    
    @Autowired
    private RestTemplate restTemplate;
    
    // Remove this autowired field and use static method directly
    // @Autowired
    // private SignatureUtil signatureUtil;  // Remove this line
    
    @Transactional
    public EsewaPaymentRequest initiatePayment(Long orderId) {
        try {
            System.out.println("Initiating payment for order ID: " + orderId);
            
            Order order = orderRepo.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
            
            // Generate unique transaction UUID
            String transactionUuid = UUID.randomUUID().toString();
            
            // Format amount to 2 decimal places
            String totalAmount = order.getTotalAmount().setScale(2).toString();
            String amount = totalAmount;
            
            System.out.println("Order Amount: " + totalAmount);
            System.out.println("Transaction UUID: " + transactionUuid);
            System.out.println("Product Code: " + productCode);
            
            // Update order with transaction details
            order.setTransactionUuid(transactionUuid);
            order.setPaymentMethod("ESEWA");
            order.setStatus("Payment Pending");
            orderRepo.save(order);
            
            // Generate signature using static method
            String signature = SignatureUtil.generateEsewaSignature(totalAmount, transactionUuid, productCode);
            
            // Create payment request
            EsewaPaymentRequest request = new EsewaPaymentRequest();
            request.setAmount(amount);
            request.setTax_amount("0");
            request.setTotal_amount(totalAmount);
            request.setTransaction_uuid(transactionUuid);
            request.setProduct_code(productCode);
            request.setProduct_service_charge("0");
            request.setProduct_delivery_charge("0");
            request.setSuccess_url(successUrl);
            request.setFailure_url(failureUrl);
            request.setSigned_field_names("total_amount,transaction_uuid,product_code");
            request.setSignature(signature);
            request.setOrderId(order.getOrderId());
            
            System.out.println("Created eSewa payment request: " + request);
            
            return request;
            
        } catch (Exception e) {
            System.err.println("Error initiating payment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to initiate eSewa payment: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public boolean verifyPayment(String transactionUuid, String totalAmount) {
        try {
            System.out.println("Verifying payment for transaction: " + transactionUuid);
            
            // Find order by transaction UUID
            Order order = orderRepo.findByTransactionUuid(transactionUuid)
                    .orElseThrow(() -> new RuntimeException("Order not found for transaction: " + transactionUuid));
            
            // Prepare verification request
            Map<String, String> verificationRequest = new HashMap<>();
            verificationRequest.put("product_code", productCode);
            verificationRequest.put("total_amount", totalAmount);
            verificationRequest.put("transaction_uuid", transactionUuid);
            
            // Generate signature for verification using static method
            String message = String.format("total_amount=%s,transaction_uuid=%s,product_code=%s",
                    totalAmount, transactionUuid, productCode);
            String signature = SignatureUtil.generateSignature(message);
            verificationRequest.put("signature", signature);
            
            // Call eSewa verification API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(verificationRequest, headers);
            
            ResponseEntity<EsewaStatusResponse> response = restTemplate.exchange(
                    verificationUrl,
                    HttpMethod.POST,
                    entity,
                    EsewaStatusResponse.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                EsewaStatusResponse statusResponse = response.getBody();
                
                System.out.println("Verification response: " + statusResponse.getStatus());
                
                if ("COMPLETE".equalsIgnoreCase(statusResponse.getStatus())) {
                    // Update order status
                    order.setStatus("Paid");
                    order.setPaymentMethod("ESEWA");
                    orderRepo.save(order);
                    
                    return true;
                }
            }
            
            return false;
            
        } catch (Exception e) {
            System.err.println("Error verifying payment: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    public Map<String, String> getEsewaPaymentFormData(EsewaPaymentRequest request) {
        Map<String, String> formData = new HashMap<>();
        formData.put("amount", request.getAmount());
        formData.put("tax_amount", request.getTax_amount());
        formData.put("total_amount", request.getTotal_amount());
        formData.put("transaction_uuid", request.getTransaction_uuid());
        formData.put("product_code", request.getProduct_code());
        formData.put("product_service_charge", request.getProduct_service_charge());
        formData.put("product_delivery_charge", request.getProduct_delivery_charge());
        formData.put("success_url", request.getSuccess_url());
        formData.put("failure_url", request.getFailure_url());
        formData.put("signed_field_names", request.getSigned_field_names());
        formData.put("signature", request.getSignature());
        
        return formData;
    }
}