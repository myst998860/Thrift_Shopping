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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

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

//    @PostMapping("/checkout")
//    public Object checkout(@RequestBody CheckoutRequest request) {
//        // 1️⃣ Create order
//        Order order = new Order();
//        order.setUserId(request.getUserId());
//        order.setUserEmail(request.getUserEmail());
//        order.setPaymentMethod(request.getPaymentMethod());
//        order.setStatus(request.getPaymentMethod().equalsIgnoreCase("COD") ? "Pending" : "Payment Pending");
//        order.setTotalAmount(request.getTotalAmount());
//        order.setAddress(request.getAddress());
//
//        Order savedOrder = orderRepo.save(order);
//
//        // 2️⃣ Save order items
//        for (CheckoutRequest.Item item : request.getItems()) {
//            OrderItem orderItem = new OrderItem();
//            orderItem.setOrder(savedOrder);
//            orderItem.setProductId(item.getProductId());
//            orderItem.setQuantity(item.getQuantity());
//            orderItem.setPrice(item.getPrice());
//            orderItem.setVenueId(item.getVenueId());
//
//            if (item.getVenueId() != null) {
//                venueRepo.findById(item.getVenueId())
//                         .ifPresent(v -> orderItem.setVenueName(v.getVenueName()));
//            }
//
//            orderItemRepo.save(orderItem);
//        }
//
//        // 3️⃣ Extract venue info AFTER saving items
//        OrderItem firstItem = orderItemRepo.findByOrder(savedOrder).stream().findFirst().orElse(null);
//        String venueNames = "Venue";
//        Long venueId = null;
//
////        Long venueId = null;
//        String venueName = "Venue";
//        if (firstItem != null) {
//            venueId = firstItem.getVenueId();
//            venueName = firstItem.getVenueName();
//        }
//
//        // 4️⃣ Call notification service
//        notificationService.createOrderNotification(
//            savedOrder.getUserId(),
//            savedOrder.getOrderId(),
//            savedOrder.getTotalAmount(),
//            venueId,
//            venueName
//        );
//
//
//        System.out.println("✅ Order notification sent for order #" + savedOrder.getOrderId());
//
//        // 5️⃣ COD: send email & return order
//        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
//            emailService.sendEmail(
//                    request.getUserEmail(),
//                    "Order Placed",
//                    "Hello, your order " + savedOrder.getOrderId() +
//                    " has been placed successfully. Pay via COD on delivery."
//            );
//            return savedOrder;
//        }
//
//        // 6️⃣ eSewa: generate payment request
//        String transactionUuid = UUID.randomUUID().toString();
//        savedOrder.setTransactionUuid(transactionUuid);
//        orderRepo.save(savedOrder);
//
//        String amount = savedOrder.getTotalAmount().setScale(2).toString(); // e.g. "1500.00"
//        String message = String.format("total_amount=%s,transaction_uuid=%s,product_code=%s",
//                amount, transactionUuid, "EPAYTEST");
//        String signature = SignatureUtil.generateSignature(message);
//
//        EsewaPaymentRequest esewaRequest = new EsewaPaymentRequest();
//        esewaRequest.setAmount(amount);
//        esewaRequest.setTax_amount("0");
//        esewaRequest.setTotal_amount(amount);
//        esewaRequest.setTransaction_uuid(transactionUuid);
//        esewaRequest.setProduct_code("EPAYTEST");
//        esewaRequest.setProduct_service_charge("0");
//        esewaRequest.setProduct_delivery_charge("0");
//        esewaRequest.setSuccess_url("http://localhost:8080/api/payments/esewa/success");
//        esewaRequest.setFailure_url("http://localhost:8080/api/payments/esewa/failure");
//        esewaRequest.setSigned_field_names("total_amount,transaction_uuid,product_code");
//        esewaRequest.setSignature(signature);
//        esewaRequest.setOrderId(savedOrder.getOrderId());
//
//        return Map.of(
//                "orderId", savedOrder.getOrderId(),
//                "esewaPaymentRequest", esewaRequest
//        );
//    }
    
    
    @PostMapping("/checkout")
    public Object checkout(@RequestBody CheckoutRequest request) {
        // 1️⃣ Create order
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setUserEmail(request.getUserEmail());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(request.getPaymentMethod().equalsIgnoreCase("COD") ? "Pending" : "Payment Pending");
        order.setTotalAmount(request.getTotalAmount());
        order.setAddress(request.getAddress());

        Order savedOrder = orderRepo.save(order);
        

        // 2️⃣ Create arrays to hold venue info (arrays are effectively final)
        final Long[] venueHolder = new Long[]{null};
        final String[] venueNameHolder = new String[]{"Venue"};
        
        // 3️⃣ Save order items
        for (CheckoutRequest.Item item : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProductId(item.getProductId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getPrice());
            orderItem.setVenueId(item.getVenueId());

            if (item.getVenueId() != null) {
                venueRepo.findById(item.getVenueId())
                         .ifPresent(v -> {
                             orderItem.setVenueName(v.getVenueName());
                             // Capture venue info from the first item using holders
                             if (venueHolder[0] == null) {
                                 venueHolder[0] = item.getVenueId();
                                 venueNameHolder[0] = v.getVenueName();
                             }
                         });
            }

            orderItemRepo.save(orderItem);
        }
        
        // 4️⃣ Extract venue info from holders
        Long venueId = venueHolder[0];
        String venueName = venueNameHolder[0];

        // 5️⃣ Debug logging for extracted venue info
        System.out.println("🎯 Extracted venue info - ID: " + venueId + ", Name: " + venueName);
        System.out.println("🎯 Order details - ID: " + savedOrder.getOrderId() + 
                         ", Amount: " + savedOrder.getTotalAmount());

        // 6️⃣ Call notification service with ALL required parameters
        notificationService.createOrderNotification(
            savedOrder.getUserId(),
            savedOrder.getOrderId(),
            savedOrder.getTotalAmount(),
            venueId,
            venueName
        );

        System.out.println("✅ Order notification sent for order #" + savedOrder.getOrderId());

        // 7️⃣ COD: send email & return order
        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            // Send email to customer
            String customerEmailBody = "Hello " + request.getUserEmail() + ",\n\n" +
                    "Your order #" + savedOrder.getOrderId() + 
                    " has been placed successfully.\n" +
                    "Total Amount: NPR " + savedOrder.getTotalAmount() + "\n" +
                    "Venue: " + venueName + "\n" +
                    "Payment Method: Cash on Delivery\n" +
                    "We will contact you soon for delivery.\n\n" +
                    "Thank you!";
            
            emailService.sendEmail(
                    request.getUserEmail(),
                    "Order Placed Successfully - #" + savedOrder.getOrderId(),
                    customerEmailBody
            );
            
            // Also send email to admin (optional)
            String adminEmailBody = "New COD Order Received!\n\n" +
                    "Order ID: #" + savedOrder.getOrderId() + "\n" +
                    "Customer: " + request.getUserEmail() + "\n" +
                    "Amount: NPR " + savedOrder.getTotalAmount() + "\n" +
                    "Venue: " + venueName + "\n" +
                    "Address: " + request.getAddress();
            
            // Uncomment and replace with your admin email
            // emailService.sendEmail(
            //         "admin@example.com",
            //         "New COD Order - #" + savedOrder.getOrderId(),
            //         adminEmailBody
            // );
            
            return savedOrder;
        }

        // 8️⃣ eSewa: generate payment request
        String transactionUuid = UUID.randomUUID().toString();
        savedOrder.setTransactionUuid(transactionUuid);
        orderRepo.save(savedOrder);

        String amount = savedOrder.getTotalAmount().setScale(2).toString(); // e.g. "1500.00"
        String message = String.format("total_amount=%s,transaction_uuid=%s,product_code=%s",
                amount, transactionUuid, "EPAYTEST");
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
//    @PutMapping("/{orderId}/status/{status}")
//    public ResponseEntity<?> updateOrderStatus(
//            @PathVariable Long orderId,
//            @PathVariable String status
//    ) {
//        // 1️⃣ Fetch the order
//        Order order = orderRepo.findById(orderId)
//                .orElseThrow(() -> new RuntimeException("Order not found"));
//
//        // 2️⃣ Update the status
//        order.setStatus(status);
//        orderRepo.save(order);
//
//        // 3️⃣ Send email to user
//        String userEmail = order.getUserEmail();
//        if (userEmail != null && !userEmail.isBlank()) {
//            String subject = "";
//            String body = "Hello, your order #" + order.getOrderId() + " status has been updated.\n\n";
//
//            switch (status.toLowerCase()) {
//                case "pending":
//                    subject = "Order Pending";
//                    body += "Your order is pending.";
//                    break;
//
//                case "processing":
//                    subject = "Order Processing";
//                    body += "Your Order has be processed from our service and will be shipped soon.";
//                    break;
//
//                case "shipped":
//                    subject = "Order Dispatched";
//                    body += "Your order has been dispatched and is on the way.";
//                    break;
//
//                case "completed":
//                    subject = "Order Delivered";
//                    body += "Your order has been delivered successfully.";
//                    break;
//
//                case "cancelled":
//                case "canceled":
//                    subject = "Order Cancelled";
//                    body += "Your order has been cancelled.";
//                    break;
//
//                default:
//                    subject = "Order Status Updated";
//                    body += "Your order status has been updated to: " + status;
//            }
//
//            emailService.sendEmail(userEmail, subject, body);
//        }
//
//        // 4️⃣ Return the updated order
//        return ResponseEntity.ok(order);
//    }

    @PutMapping("/{orderId}/status/{status}")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @PathVariable String status
    ) {
        try {
            // 1️⃣ Fetch the order with its items
            Order order = orderRepo.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

            // Get venue info from order items
            Long venueId = null;
            String venueName = "Venue";
            
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                OrderItem firstItem = order.getItems().get(0);
                if (firstItem.getVenueId() != null) {
                    venueId = firstItem.getVenueId();
                    venueName = firstItem.getVenueName() != null ? 
                               firstItem.getVenueName() : "Venue";
                }
            }

            // 2️⃣ Update the status
            String oldStatus = order.getStatus();
            order.setStatus(status);
            Order updatedOrder = orderRepo.save(order);

            // 3️⃣ Send email notification to user
            String userEmail = order.getUserEmail();
            if (userEmail != null && !userEmail.isBlank()) {
                sendStatusUpdateEmail(userEmail, order, status);
            }

            // 4️⃣ Send in-website notification to user
            sendStatusUpdateNotification(order.getUserId(), orderId, status, venueId, venueName);

            // 5️⃣ Send notification to admin about status change
            notifyAdminAboutStatusChange(order, oldStatus, status, venueName);

            System.out.println("✅ Status updated to: " + status + " for order #" + orderId);
            System.out.println("✅ Notifications sent to user and admin");

            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            System.err.println("❌ Error updating order status: " + e.getMessage());
            return ResponseEntity.status(500).body("Error updating order status: " + e.getMessage());
        }
    }
    
    
    
    private void sendStatusUpdateEmail(String userEmail, Order order, String newStatus) {
        String subject = "";
        String body = "Hello, your order #" + order.getOrderId() + " status has been updated.\n\n";

        switch (newStatus.toLowerCase()) {
            case "pending":
                subject = "Order Pending";
                body += "Your order is pending and awaiting confirmation.";
                break;
            case "processing":
                subject = "Order Processing";
                body += "Your order has been confirmed and is being processed.";
                body += "\n\nOrder Details:";
                body += "\n- Order ID: #" + order.getOrderId();
                body += "\n- Total Amount: NPR " + order.getTotalAmount();
                body += "\n- Payment Method: " + order.getPaymentMethod();
                body += "\n\nWe'll notify you once your order is shipped.";
                break;
            case "shipped":
                subject = "Order Dispatched";
                body += "Great news! Your order has been shipped.";
                body += "\n\nTracking Details:";
                body += "\n- Order ID: #" + order.getOrderId();
                body += "\n- Shipping Address: " + order.getAddress();
                body += "\n- Expected Delivery: 3-5 business days";
                break;
            case "completed":
                subject = "Order Delivered";
                body += "Your order has been successfully delivered!";
                body += "\n\nThank you for shopping with us.";
                body += "\n\nOrder Summary:";
                body += "\n- Order ID: #" + order.getOrderId();
                body += "\n- Total Paid: NPR " + order.getTotalAmount();
                body += "\n- Delivery Address: " + order.getAddress();
                body += "\n\nWe hope you enjoy your purchase!";
                break;
            case "cancelled":
            case "canceled":
                subject = "Order Cancelled";
                body += "Your order has been cancelled.";
                body += "\n\nIf this was a mistake or you have any questions,";
                body += "\nplease contact our customer support.";
                break;
            default:
                subject = "Order Status Updated";
                body += "Your order status has been updated to: " + newStatus;
        }

        body += "\n\nThank you for choosing our service!";
        
        try {
            emailService.sendEmail(userEmail, subject, body);
            System.out.println("✅ Status email sent to: " + userEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send status email: " + e.getMessage());
        }
    }

    private void sendStatusUpdateNotification(Long userId, Long orderId, String status, Long venueId, String venueName) {
        try {
            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setRecipientId(userId);
            notificationDTO.setSenderId(userId); // System sends this notification
            notificationDTO.setType("ORDER_STATUS");
            notificationDTO.setBookingId(orderId);
            notificationDTO.setVenueId(venueId);
            notificationDTO.setVenueName(venueName);
            
            switch (status.toLowerCase()) {
                case "processing":
                    notificationDTO.setTitle("Order Processing");
                    notificationDTO.setMessage("Your order #" + orderId + " is now being processed.");
                    break;
                case "shipped":
                    notificationDTO.setTitle("Order Shipped");
                    notificationDTO.setMessage("Your order #" + orderId + " has been shipped and is on its way!");
                    break;
                case "completed":
                    notificationDTO.setTitle("Order Delivered");
                    notificationDTO.setMessage("Your order #" + orderId + " has been successfully delivered!");
                    break;
                case "cancelled":
                case "canceled":
                    notificationDTO.setTitle("Order Cancelled");
                    notificationDTO.setMessage("Your order #" + orderId + " has been cancelled.");
                    break;
                default:
                    notificationDTO.setTitle("Order Status Updated");
                    notificationDTO.setMessage("Your order #" + orderId + " status has been updated to: " + status);
            }
            
            notificationService.createNotificationsForAllRoles(notificationDTO);
            System.out.println("✅ In-website notification sent for order #" + orderId);
        } catch (Exception e) {
            System.err.println("❌ Failed to send in-website notification: " + e.getMessage());
        }
    }

    private void notifyAdminAboutStatusChange(Order order, String oldStatus, String newStatus, String venueName) {
        try {
            // Get all admin users
            // Note: You'll need to inject UserRepository in OrderController
            // @Autowired
            // private UserRepository userRepository;
            
            // For now, let's create a method in NotificationService for this
            notificationService.createAdminStatusNotification(
                order.getOrderId(),
                order.getUserId(),
                order.getUserEmail(),
                oldStatus,
                newStatus,
                venueName
            );
        } catch (Exception e) {
            System.err.println("❌ Failed to notify admin: " + e.getMessage());
        }
    }
    
}
