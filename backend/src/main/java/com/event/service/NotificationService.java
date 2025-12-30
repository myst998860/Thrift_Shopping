// package com.event.service;

// import com.event.dto.NotificationDTO;
// import com.event.model.NotificationType;
// import com.event.model.Order;
// import com.event.model.User;
// import com.event.repository.UserRepo;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.web.client.RestTemplate;

// import java.time.LocalDateTime;
// import java.util.List;

// @Service
// public class NotificationService {
    
//     @Autowired
//     private RestTemplate restTemplate;
    
//     public void sendOrderNotification(Long userId, Long orderId, String userEmail) {
//         NotificationDTO dto = new NotificationDTO();
//         dto.setRecipientId(userId);
//         dto.setSenderId(userId);
//         dto.setTitle("Order Placed");
//         dto.setType("ORDER");
//         dto.setMessage("Your order #" + orderId + " has been placed successfully.");
        
//         try {
//             restTemplate.postForEntity(
//                 "http://localhost:8080/notifications/create",
//                 dto,
//                 Object.class
//             );
//         } catch (Exception e) {
//             // Log error but don't throw
//             System.err.println("Notification failed: " + e.getMessage());
//         }
//     }


// }



package com.event.service;

import com.event.dto.NotificationDTO;
import com.event.dto.NotificationResponseDTO;
import com.event.model.*;
import com.event.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {
    
    @Autowired
    private NotificationRepo notificationRepository;
    
    @Autowired
    private UserRepo userRepository;
    
    @Autowired
    private PartnerRepo partnerRepository;
    
    @Autowired
    private VenueRepo venueRepository;
    
    @Autowired
    private BookingRepo bookingRepository;
    
    // ========== CREATE NOTIFICATIONS ==========
    
    public List<NotificationResponseDTO> createNotificationsForAllRoles(NotificationDTO notificationDTO) {
        // 1. Get recipient
        User recipient = userRepository.findById(notificationDTO.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found with ID: " + notificationDTO.getRecipientId()));
        
        // 2. Get sender (optional)
        User sender = getSender(notificationDTO.getSenderId());
        
        // 3. Populate missing fields
        populateMissingFields(notificationDTO);
        
        // 4. Create notifications for all roles
        List<Notification> notificationsToSave = new ArrayList<>();
        
        // Recipient notification
        notificationsToSave.add(createUserNotification(recipient, sender, notificationDTO));
        
        // Partner notifications (if venue specified)
        if (notificationDTO.getVenueId() != null) {
            notificationsToSave.addAll(createPartnerNotifications(sender, notificationDTO));
        }
        
        // Admin notifications
        notificationsToSave.addAll(createAdminNotifications(sender, notificationDTO));
        
        // 5. Save all notifications
        List<Notification> savedNotifications = notificationRepository.saveAll(notificationsToSave);
        
        // 6. Convert to DTOs
        return savedNotifications.stream()
                .map(NotificationResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    // ========== RETRIEVE NOTIFICATIONS ==========
    
    public List<NotificationResponseDTO> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
        
        return notifications.stream()
                .map(NotificationResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    public Long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        return notificationRepository.countByRecipientAndStatus(user, NotificationStatus.UNREAD);
    }
    
    public List<NotificationResponseDTO> getNotificationsByStatus(Long userId, NotificationStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        List<Notification> notifications = notificationRepository
                .findByRecipientAndStatusOrderByCreatedAtDesc(user, status);
        
        return notifications.stream()
                .map(NotificationResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    // ========== UPDATE NOTIFICATIONS ==========
    
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = getNotificationWithAuthorization(notificationId, userId);
        notification.setStatus(NotificationStatus.READ);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }
    
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        notificationRepository.updateStatusByRecipientAndCurrentStatus(
            user, NotificationStatus.READ, LocalDateTime.now(), NotificationStatus.UNREAD);
    }
    
    // ========== DELETE NOTIFICATIONS ==========
    
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = getNotificationWithAuthorization(notificationId, userId);
        notificationRepository.delete(notification);
    }
    
    public void clearAllNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        notificationRepository.deleteByRecipient(user);
    }
    
    // ========== PRIVATE HELPER METHODS ==========
    
    private User getSender(Long senderId) {
        return (senderId != null) ? 
            userRepository.findById(senderId).orElse(null) : null;
    }
    
    private void populateMissingFields(NotificationDTO dto) {
        if (dto.getVenueName() == null && dto.getVenueId() != null) {
            venueRepository.findById(dto.getVenueId())
                    .ifPresent(venue -> dto.setVenueName(venue.getVenueName()));
        }
        
        if (dto.getBookedTime() == null && dto.getBookingId() != null) {
            bookingRepository.findById(dto.getBookingId())
                    .ifPresent(booking -> dto.setBookedTime(booking.getBookedTime()));
        }
    }
    
    private Notification createUserNotification(User recipient, User sender, NotificationDTO dto) {
        return buildNotification(recipient, sender, dto);
    }
    
    private List<Notification> createPartnerNotifications(User sender, NotificationDTO dto) {
        List<Notification> notifications = new ArrayList<>();
        List<Partner> partners = partnerRepository.findByRoleAndVenueId("PARTNER", dto.getVenueId());
        
        for (Partner partner : partners) {
            notifications.add(buildNotification(partner, sender, dto));
        }
        
        return notifications;
    }
    
    private List<Notification> createAdminNotifications(User sender, NotificationDTO dto) {
        List<Notification> notifications = new ArrayList<>();
        List<User> admins = userRepository.findByRole("ROLE_ADMIN");
        
        for (User admin : admins) {
            notifications.add(buildNotification(admin, sender, dto));
        }
        
        return notifications;
    }
    
    private Notification buildNotification(User recipient, User sender, NotificationDTO dto) {
        String message = buildMessageForRole(recipient, sender, dto);
        
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setSender(sender);
        notification.setTitle(dto.getTitle());
        notification.setMessage(message);
        notification.setType(NotificationType.valueOf(dto.getType().toUpperCase()));
        notification.setBookingId(dto.getBookingId());
        notification.setVenueId(dto.getVenueId());
        notification.setStatus(NotificationStatus.UNREAD);
        
        return notification;
    }
    
    private String buildMessageForRole(User recipient, User sender, NotificationDTO dto) {
        String role = recipient.getRole();
        String senderName = sender != null ? sender.getFullname() : "User";
        
        try {
            NotificationType type = NotificationType.valueOf(dto.getType().toUpperCase());
            
            if (type == NotificationType.ORDER) {
                if ("ATTENDEE".equalsIgnoreCase(role) || "USER".equalsIgnoreCase(role)) {
                    return "Your order has been placed successfully.";
                }
                if ("ADMIN".equalsIgnoreCase(role) || "ROLE_ADMIN".equalsIgnoreCase(role)) {
                    return "A new order has been placed by " + senderName + ".";
                }
            }
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid notification type: " + dto.getType());
        }
        
        return "You have a new notification.";
    }
    
    private Notification getNotificationWithAuthorization(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));
        
        if (!notification.getRecipient().getUser_id().equals(userId)) {
            throw new RuntimeException("Unauthorized access to notification");
        }
        
        return notification;
    }


    /**
     * Create order placement notification
     */
//    public void createOrderNotification(Long userId, Long orderId, BigDecimal totalAmount) {
//        // 1. Get recipient
//    userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("Recipient not found with ID: " + userId));
//        
//       
//        
//        // 2. Create notification DTO
//        NotificationDTO notificationDTO = new NotificationDTO();
//        notificationDTO.setRecipientId(userId);
//        notificationDTO.setSenderId(userId);
//        notificationDTO.setTitle("Order Placed Successfully");
//        notificationDTO.setType("ORDER");
//        notificationDTO.setMessage("Your order #" + orderId + " has been placed successfully. Total: NPR " + totalAmount);
//        
//        // 4. Create and save notifications for all roles
//        createNotificationsForAllRoles(notificationDTO);
//        
//        System.out.println("✅ Order notification created for order #" + orderId);
//    }
    
    
    public void createOrderNotification(Long userId, Long orderId, BigDecimal totalAmount) {
        try {
            System.out.println("🚀 Creating order notifications for order #" + orderId);
            
            // 1. Get the customer who placed the order
            User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Recipient not found with ID: " + userId));
            
            System.out.println("✅ Customer found: " + customer.getEmail());
            
            // 2. Create notification for CUSTOMER (your existing working code)
            NotificationDTO customerNotification = new NotificationDTO();
            customerNotification.setRecipientId(userId);
            customerNotification.setSenderId(userId);
            customerNotification.setTitle("Order Placed Successfully");
            customerNotification.setType("ORDER");
            customerNotification.setMessage("Your order #" + orderId + 
                " has been placed successfully. Total: NPR " + totalAmount);
            
            // This is your working method - keep it!
            createNotificationsForAllRoles(customerNotification);
            
            System.out.println("✅ Customer notification created for order #" + orderId);
            
            // 3. NEW: Create notifications for ALL ADMIN users
            List<User> allUsers = userRepository.findAll();
            int adminCount = 0;
            
            for (User user : allUsers) {
                // Check if user is admin
                if (user.getRole() != null && 
                    (user.getRole().equalsIgnoreCase("ADMIN") || 
                     user.getRole().equalsIgnoreCase("ROLE_ADMIN")) &&
                    !user.getUser_id().equals(userId)) {
                    
                    try {
                        // Create admin notification DTO
                        NotificationDTO adminNotification = new NotificationDTO();
                        adminNotification.setRecipientId(user.getUser_id()); // Admin's ID
                        adminNotification.setSenderId(userId); // Customer's ID as sender
                        adminNotification.setTitle("📦 New Order Received");
                        adminNotification.setType("ORDER");
                        adminNotification.setMessage("New order #" + orderId + 
                            " placed by " + customer.getFullname() + 
                            " (" + customer.getEmail() + ")" +
                            ". Total: NPR " + totalAmount);
                        
                        // Use your existing working method for admins too
                        createNotificationsForAllRoles(adminNotification);
                        
                        adminCount++;
                        System.out.println("✅ Admin notification sent to: " + user.getEmail());
                        
                    } catch (Exception e) {
                        System.err.println("⚠️ Failed to notify admin " + user.getEmail() + ": " + e.getMessage());
                    }
                }
            }
            
            System.out.println("🎯 Total notifications: 1 customer + " + adminCount + " admins");
            
        } catch (Exception e) {
            System.err.println("❌ Error in createOrderNotification: " + e.getMessage());
            throw e; // Re-throw to see error in OrderController
        }
    }
    
    
    
}