package com.event.controller;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.event.dto.BookingDTO;
import com.event.dto.NotificationDTO;
import com.event.dto.NotificationResponseDTO;
import com.event.model.Notification;
import com.event.model.NotificationStatus;
import com.event.model.NotificationType;
import com.event.model.Partner;
import com.event.model.User;
import com.event.repository.BookingRepo;
import com.event.repository.NotificationRepo;
import com.event.repository.PartnerRepo;
import com.event.repository.UserRepo;
import com.event.repository.VenueRepo;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    
    @Autowired
    private NotificationRepo notificationRepository;
    
    @Autowired
    private UserRepo userRepository; 
    
    @Autowired
    private PartnerRepo partnerRepository; 
    

    @Autowired
    private BookingRepo bookingRepository;
    

    @Autowired
    private VenueRepo venueRepository;
    
    @PostMapping("/create")
    public ResponseEntity<?> createNotificationsForAllRoles(@RequestBody NotificationDTO notificationDTO) {
        try {
            System.out.println("[DEBUG] createNotificationsForAllRoles called with DTO: " + notificationDTO);

            // 1. Get the attendee (recipient)
            User attendee = userRepository.findById(notificationDTO.getRecipientId())
                    .orElseThrow(() -> new RuntimeException("Attendee (recipient) not found"));
            System.out.println("[DEBUG] Attendee found: " + attendee.getEmail());

            // 2. Get the sender (optional)
            User sender = null;
            if (notificationDTO.getSenderId() != null) {
                sender = userRepository.findById(notificationDTO.getSenderId()).orElse(null);
                System.out.println("[DEBUG] Sender found: " + (sender != null ? sender.getEmail() : "null"));
            } else {
                System.out.println("[DEBUG] No senderId provided in DTO");
            }

            // ✅ 3. Fetch Venue and Booking info to populate missing DTO fields
            if (notificationDTO.getVenueName() == null && notificationDTO.getVenueId() != null) {
                venueRepository.findById(notificationDTO.getVenueId())
                        .ifPresent(venue -> {
                            notificationDTO.setVenueName(venue.getVenueName());
                        });
            }

            if (notificationDTO.getBookedTime() == null && notificationDTO.getBookingId() != null) {
                bookingRepository.findById(notificationDTO.getBookingId())
                        .ifPresent(booking -> {
                            notificationDTO.setBookedTime(booking.getBookedTime());
                        });
            }

            List<Notification> notificationsToSave = new ArrayList<>();

            // 4. Create notification for attendee
            String attendeeMessage = buildMessageForRole(attendee, sender, notificationDTO);
            Notification attendeeNotification = new Notification();
            attendeeNotification.setRecipient(attendee);
            attendeeNotification.setSender(sender);
            attendeeNotification.setTitle(notificationDTO.getTitle());
            attendeeNotification.setMessage(attendeeMessage);
            attendeeNotification.setType(NotificationType.valueOf(notificationDTO.getType().toUpperCase()));
            attendeeNotification.setBookingId(notificationDTO.getBookingId());
            attendeeNotification.setVenueId(notificationDTO.getVenueId());
            attendeeNotification.setStatus(NotificationStatus.UNREAD);
            notificationsToSave.add(attendeeNotification);

            // 5. Find partner(s)
            List<Partner> partners = partnerRepository.findByRoleAndVenueId("PARTNER", notificationDTO.getVenueId());
            for (User partner : partners) {
                String partnerMessage = buildMessageForRole(partner, sender, notificationDTO);
                Notification partnerNotification = new Notification();
                partnerNotification.setRecipient(partner);
                partnerNotification.setSender(sender);
                partnerNotification.setTitle(notificationDTO.getTitle());
                partnerNotification.setMessage(partnerMessage);
                partnerNotification.setType(NotificationType.valueOf(notificationDTO.getType().toUpperCase()));
                partnerNotification.setBookingId(notificationDTO.getBookingId());
                partnerNotification.setVenueId(notificationDTO.getVenueId());
                partnerNotification.setStatus(NotificationStatus.UNREAD);
                notificationsToSave.add(partnerNotification);
            }

            // 6. Find all admins
            List<User> admins = userRepository.findByRole("ADMIN");
            for (User admin : admins) {
                String adminMessage = buildMessageForRole(admin, sender, notificationDTO);
                Notification adminNotification = new Notification();
                adminNotification.setRecipient(admin);
                adminNotification.setSender(sender);
                adminNotification.setTitle(notificationDTO.getTitle());
                adminNotification.setMessage(adminMessage);
                adminNotification.setType(NotificationType.valueOf(notificationDTO.getType().toUpperCase()));
                adminNotification.setBookingId(notificationDTO.getBookingId());
                adminNotification.setVenueId(notificationDTO.getVenueId());
                adminNotification.setStatus(NotificationStatus.UNREAD);
                notificationsToSave.add(adminNotification);
            }

            // 7. Save all notifications
            List<Notification> savedNotifications = notificationRepository.saveAll(notificationsToSave);
            System.out.println("[DEBUG] Saved notifications count: " + savedNotifications.size());

            List<NotificationResponseDTO> responseList = savedNotifications.stream()
                    .map(NotificationResponseDTO::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responseList);

        } catch (Exception e) {
            System.err.println("[ERROR] Error creating notifications for all roles: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating notifications: " + e.getMessage());
        }
    }
    private String buildMessageForRole(User recipient, User sender, NotificationDTO dto) {
        String venueName = dto.getVenueName() != null ? dto.getVenueName() : "the venue";
        String bookedTimeStr = dto.getBookedTime() != null ? dto.getBookedTime().toString() : "a scheduled time";
        String senderName = sender != null ? sender.getFullname() : "Someone";

        String role = recipient.getRole();
        if (role == null) {
            System.out.println("[DEBUG] Recipient role is null, setting to empty string.");
            role = "";
        }

        String roleUpper = role.toUpperCase();
        System.out.println("[DEBUG] Recipient Role: " + role + " (Uppercase: " + roleUpper + ")");
        System.out.println("[DEBUG] Recipient ID: " + recipient.getUser_id() + ", Sender ID: " + (sender != null ? sender.getUser_id() : "null"));
        System.out.println("[DEBUG] Venue Name: " + venueName);
        System.out.println("[DEBUG] Booked Time: " + bookedTimeStr);
        System.out.println("[DEBUG] Sender Name: " + senderName);

        switch (roleUpper) {
            case "ATTENDEE":
                String attendeeMsg = String.format(
                    "Your booking for %s on %s has been successfully confirmed.",
                    venueName,
                    bookedTimeStr
                );
                System.out.println("[DEBUG] Generated Message (ATTENDEE): " + attendeeMsg);
                return attendeeMsg;

            case "PARTNER":
                String partnerMsg = String.format(
                    "Your Venue %s has been booked by %s on %s.",
                    venueName,
                    senderName,
                    bookedTimeStr
                );
                System.out.println("[DEBUG] Generated Message (PARTNER): " + partnerMsg);
                return partnerMsg;

            case "ADMIN":
                String adminMsg = String.format(
                    "Booking at %s by %s requires your attention.",
                    venueName,
                    senderName
                );
                System.out.println("[DEBUG] Generated Message (ADMIN): " + adminMsg);
                return adminMsg;

            default:
                System.out.println("[DEBUG] Role did not match any case, using default message.");
                return "You have a new notification.";
        }
    }
    
    // Get all notifications for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotifications(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }
            
            List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
            List<NotificationResponseDTO> response = notifications.stream()
                .map(NotificationResponseDTO::new)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching notifications: " + e.getMessage());
        }
    }
    
    // Get unread notifications count
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }
            
            Long count = notificationRepository.countByRecipientAndStatus(user, NotificationStatus.UNREAD);
            return ResponseEntity.ok(Map.of("count", count));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error getting unread count: " + e.getMessage());
        }
    }
    
    // Get notifications by status
    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<?> getNotificationsByStatus(@PathVariable Long userId, @PathVariable String status) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }
            
            NotificationStatus notificationStatus;
            try {
                notificationStatus = NotificationStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(400).body("Invalid status. Use: unread, read, or archived");
            }
            
            List<Notification> notifications = notificationRepository.findByRecipientAndStatusOrderByCreatedAtDesc(user, notificationStatus);
            List<NotificationResponseDTO> response = notifications.stream()
                .map(NotificationResponseDTO::new)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching notifications: " + e.getMessage());
        }
    }
    
    
    // Mark notification as read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId, @RequestParam Long userId) {
        try {
            Notification notification = notificationRepository.findById(notificationId).orElse(null);
            if (notification == null) {
                return ResponseEntity.status(404).body("Notification not found");
            }
            
            if (!notification.getRecipient().getUser_id().equals(userId)) {
                return ResponseEntity.status(403).body("Unauthorized access to notification");
            }
            
            notification.setStatus(NotificationStatus.READ);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
            
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error marking notification as read: " + e.getMessage());
        }
    }
    
    // Mark all notifications as read for a user
    @PutMapping("/user/{userId}/mark-all-read")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }
            
            notificationRepository.updateStatusByRecipientAndCurrentStatus(
                user, NotificationStatus.READ, LocalDateTime.now(), NotificationStatus.UNREAD);
            
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error marking all as read: " + e.getMessage());
        }
    }
    
    // Delete notification
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId, @RequestParam Long userId) {
        try {
            Notification notification = notificationRepository.findById(notificationId).orElse(null);
            if (notification == null) {
                return ResponseEntity.status(404).body("Notification not found");
            }
            
            if (!notification.getRecipient().getUser_id().equals(userId)) {
                return ResponseEntity.status(403).body("Unauthorized access to notification");
            }
            
            notificationRepository.delete(notification);
            return ResponseEntity.ok(Map.of("message", "Notification deleted"));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting notification: " + e.getMessage());
        }
    }
    
    // Clear all notifications for a user
    @DeleteMapping("/user/{userId}/clear-all")
    public ResponseEntity<?> clearAllNotifications(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }
            
            notificationRepository.deleteByRecipient(user);
            return ResponseEntity.ok(Map.of("message", "All notifications cleared"));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error clearing notifications: " + e.getMessage());
        }
    }
    
//    // Helper methods for booking workflow (call these from your booking controller)
//    @PostMapping("/booking-request")
//    public ResponseEntity<?> notifyBookingRequest(@RequestParam Long partnerId, 
//                                                @RequestParam Long customerId, 
//                                                @RequestParam Long bookingId, 
//                                                @RequestParam String venueName) {
//        NotificationDTO request = new NotificationDTO();
//        request.setRecipientId(partnerId);
//        request.setSenderId(customerId);
//        request.setTitle("New Booking Request");
//        request.setMessage("You have received a new booking request for " + venueName);
//        request.setType("BOOKING_REQUEST");
//        request.setBookingId(bookingId);
//        
//        return createNotification(request);
//    }
//    
//    @PostMapping("/booking-approved")
//    public ResponseEntity<?> notifyBookingApproved(@RequestParam Long customerId, 
//                                                 @RequestParam Long partnerId, 
//                                                 @RequestParam Long bookingId, 
//                                                 @RequestParam String venueName) {
//    	NotificationDTO request = new NotificationDTO();
//        request.setRecipientId(customerId);
//        request.setSenderId(partnerId);
//        request.setTitle("Booking Approved");
//        request.setMessage("Your booking for " + venueName + " has been approved!");
//        request.setType("BOOKING_APPROVED");
//        request.setBookingId(bookingId);
//        
//        return createNotification(request);
//    }
//    
//    @PostMapping("/booking-rejected")
//    public ResponseEntity<?> notifyBookingRejected(@RequestParam Long customerId, 
//                                                 @RequestParam Long partnerId, 
//                                                 @RequestParam Long bookingId, 
//                                                 @RequestParam String venueName) {
//    	NotificationDTO request = new NotificationDTO();
//        request.setRecipientId(customerId);
//        request.setSenderId(partnerId);
//        request.setTitle("Booking Rejected");
//        request.setMessage("Unfortunately, your booking for " + venueName + " has been rejected.");
//        request.setType("BOOKING_REJECTED");
//        request.setBookingId(bookingId);
//        
//        return createNotification(request);
//    }
//    
//    @PostMapping("/payment-received")
//    public ResponseEntity<?> notifyPaymentReceived(@RequestParam Long partnerId, 
//                                                 @RequestParam Long customerId, 
//                                                 @RequestParam Long bookingId, 
//                                                 @RequestParam Double amount) {
//    	NotificationDTO request = new NotificationDTO();
//        request.setRecipientId(partnerId);
//        request.setSenderId(customerId);
//        request.setTitle("Payment Received");
//        request.setMessage("Payment of NPR " + amount + " has been received for booking #" + bookingId);
//        request.setType("PAYMENT_RECEIVED ");
//        request.setBookingId(bookingId);
//        
//        return createNotification(request);
//    }
}