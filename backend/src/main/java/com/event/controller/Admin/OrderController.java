package com.event.controller.Admin;



import com.event.dto.CheckoutRequest;
import com.event.dto.EsewaPaymentRequest;
import com.event.dto.NotificationDTO;
import com.event.model.NotificationType;
import com.event.model.Order;
import com.event.model.OrderItem;
import com.event.repository.OrderItemRepo;
import com.event.repository.OrderRepo;
import com.event.repository.VenueRepo;
import com.event.service.EmailService;
import com.event.service.NotificationService;
import com.event.util.SignatureUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepo orderRepo;
    
    @Autowired
    private VenueRepo venueRepo;

    @Autowired
    private OrderItemRepo orderItemRepo;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private NotificationService notificationService;

    @PostMapping("/checkout")
    public Object checkout(@RequestBody CheckoutRequest request) {
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setUserEmail(request.getUserEmail());
        order.setPaymentMethod(request.getPaymentMethod());

        // Status depends on payment method
        order.setStatus(request.getPaymentMethod().equalsIgnoreCase("COD") ? "Pending" : "Payment Pending");
        order.setTotalAmount(request.getTotalAmount());
        order.setAddress(request.getAddress());

        Order savedOrder = orderRepo.save(order);

        // ✅ ✅ ✅ NOTIFICATION CODE STARTS HERE ✅ ✅ ✅
        try {
            System.out.println("notification data: "+ savedOrder);
            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setRecipientId(savedOrder.getUserId());
            notificationDTO.setSenderId(savedOrder.getUserId());
            notificationDTO.setTitle("Order Placed Successfully");
            notificationDTO.setType("ORDER");
            notificationDTO.setMessage("Your order #" + savedOrder.getOrderId() + 
                " has been placed successfully. Total: NPR " + savedOrder.getTotalAmount());
            
            // Call notification endpoint
            // restTemplate.postForEntity(
            //     "http://localhost:8080/notifications/create",
            //     notificationDTO,
            //     Object.class
            // );

            // Call notification service directly
            notificationService.createOrderNotification(
                savedOrder.getUserId(),
                savedOrder.getOrderId(),
                savedOrder.getTotalAmount()
            );
            
         
            
            System.out.println("✅ Order notification sent for order #" + savedOrder.getOrderId());
            
    
        
        
        } catch (Exception e) {
            System.err.println("❌ Failed to send notification: " + e.getMessage());
            // Don't fail the order if notification fails
        }
        // ✅ ✅ ✅ NOTIFICATION CODE ENDS HERE ✅ ✅ ✅

        // Save order items
        for (CheckoutRequest.Item item : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProductId(item.getProductId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getPrice());
            orderItem.setVenueId(item.getVenueId());

            if (item.getVenueId() != null) {
                venueRepo.findById(item.getVenueId()).ifPresent(v -> orderItem.setVenueName(v.getVenueName()));
            }

            orderItemRepo.save(orderItem);
        }

        // COD: send email & return order
        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            emailService.sendEmail(
                    request.getUserEmail(),
                    "Order Placed",
                    "Hello, your order " + savedOrder.getOrderId() + " has been placed successfully. Pay via COD on delivery."
            );
            return savedOrder;
        }

        // eSewa: generate payment request
        String transactionUuid = UUID.randomUUID().toString();
        savedOrder.setTransactionUuid(transactionUuid);
        orderRepo.save(savedOrder);

        String amount = savedOrder.getTotalAmount().setScale(2).toString(); // e.g. "1500.00"

        // Correct message format for eSewa v2 signature
        String message = String.format("total_amount=%s,transaction_uuid=%s,product_code=%s",
                amount, transactionUuid, "EPAYTEST");

        // Now call generateSignature with the full message
        String signature = SignatureUtil.generateSignature(message);

        EsewaPaymentRequest esewaRequest = new EsewaPaymentRequest();
        esewaRequest.setAmount(amount);
        esewaRequest.setTax_amount("0");
        esewaRequest.setTotal_amount(amount);
        esewaRequest.setTransaction_uuid(transactionUuid);
        esewaRequest.setProduct_code("EPAYTEST");
        esewaRequest.setProduct_service_charge("0");
        esewaRequest.setProduct_delivery_charge("0");
        esewaRequest.setSuccess_url("http://localhost:8080/api/payments/esewa/success");
        esewaRequest.setFailure_url("http://localhost:8080/api/payments/esewa/failure");
        esewaRequest.setSigned_field_names("total_amount,transaction_uuid,product_code");
        esewaRequest.setSignature(signature);
        esewaRequest.setOrderId(savedOrder.getOrderId());

        return Map.of(
                "orderId", savedOrder.getOrderId(),
                "esewaPaymentRequest", esewaRequest
        );
    }
    
//    @GetMapping("/user/{userId}")
//    public List<Order> getOrdersByUserId(@PathVariable Long userId) {
//        List<Order> orders = orderRepo.findByUserId(userId);
//        // Add venue name to each item dynamically
//        orders.forEach(order -> {
//            order.getItems().forEach(item -> {
//                String venueName = venueRepo.findById(item.getProductId())
//                                            .map(v -> v.getVenueName())
//                                            .orElse("Unknown Venue");
//                // You can temporarily store it in a new field in OrderItem or use a transient field
//                item.setVenueName(venueName); 
//            });
//        });
//
//        return orders;
//    }
    
    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUserId(@PathVariable Long userId) {

        List<Order> orders = orderRepo.findByUserId(userId);

        orders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().forEach(item -> {

                    // ✅ VERY IMPORTANT null check
                    if (item.getVenueId() != null) {
                        String venueName = venueRepo
                                .findById(item.getVenueId())
                                .map(v -> v.getVenueName())
                                .orElse("Unknown Venue");

                        item.setVenueName(venueName);
                    } else {
                        item.setVenueName("Unknown Venue");
                    }
                });
            }
        });

        return orders;
    }
    
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

//    @PutMapping("/{orderId}/status/{status}")
//    public Order updateStatus(@PathVariable Long orderId, @PathVariable String status) {
//        Order order = orderRepo.findById(orderId).orElseThrow();
//        order.setStatus(status);
//        orderRepo.save(order);
//        return order;
//    }
    
    
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        return orderRepo.findById(orderId)
                .map(order -> ResponseEntity.ok(order))
                .orElseGet(() -> ResponseEntity.status(404).body(null));
    }
    
    
 // In OrderController.java
    @PutMapping("/{orderId}/status/{status}")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @PathVariable String status
    ) {
        // 1️⃣ Fetch the order
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // 2️⃣ Update the status
        order.setStatus(status);
        orderRepo.save(order);

        // 3️⃣ Send email to user
        String userEmail = order.getUserEmail();
        if (userEmail != null && !userEmail.isBlank()) {
            String subject = "";
            String body = "Hello, your order #" + order.getOrderId() + " status has been updated.\n\n";

            switch (status.toLowerCase()) {
                case "pending":
                    subject = "Order Pending";
                    body += "Your order is pending.";
                    break;

                case "processing":
                    subject = "Order Processing";
                    body += "Your Order has be processed from our service and will be shipped soon.";
                    break;

                case "shipped":
                    subject = "Order Dispatched";
                    body += "Your order has been dispatched and is on the way.";
                    break;

                case "completed":
                    subject = "Order Delivered";
                    body += "Your order has been delivered successfully.";
                    break;

                case "cancelled":
                case "canceled":
                    subject = "Order Cancelled";
                    body += "Your order has been cancelled.";
                    break;

                default:
                    subject = "Order Status Updated";
                    body += "Your order status has been updated to: " + status;
            }

            emailService.sendEmail(userEmail, subject, body);
        }

        // 4️⃣ Return the updated order
        return ResponseEntity.ok(order);
    }

    
    
    
    
}
