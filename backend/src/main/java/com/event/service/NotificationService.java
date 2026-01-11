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
                .orElseThrow(
                        () -> new RuntimeException("Recipient not found with ID: " + notificationDTO.getRecipientId()));

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
        return (senderId != null) ? userRepository.findById(senderId).orElse(null) : null;
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

            // Handle ORDER type notifications
            if (type == NotificationType.ORDER) {
                if ("ATTENDEE".equalsIgnoreCase(role) || "USER".equalsIgnoreCase(role)) {
                    // Customer message
                    return "Your order #" + dto.getBookingId() +
                            " has been placed successfully. Total: NPR " + dto.getTotalAmount();
                }
                if ("ADMIN".equalsIgnoreCase(role) || "ROLE_ADMIN".equalsIgnoreCase(role)) {
                    // Admin message
                    return "A new order OrderID" + dto.getBookingId() +
                            " has been placed by " + senderName +
                            " | Total: NPR " + dto.getTotalAmount() +
                            " | Product Name: " + dto.getVenueName();
                }
                if ("PARTNER".equalsIgnoreCase(role)) {
                    // Partner message
                    return "A new order #" + dto.getBookingId() +
                            " has been placed for your venue: " + dto.getVenueName() +
                            " | Total: NPR " + dto.getTotalAmount();
                }
            }

            // Handle ORDER_STATUS type notifications
            if (type == NotificationType.ORDER_STATUS) {
                // Get the actual message from the DTO
                if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                    return dto.getMessage();
                }

                // Fallback messages based on role
                if ("ATTENDEE".equalsIgnoreCase(role) || "USER".equalsIgnoreCase(role)) {
                    return "Your order #" + dto.getBookingId() +
                            " status has been updated.";
                }
                if ("ADMIN".equalsIgnoreCase(role) || "ROLE_ADMIN".equalsIgnoreCase(role)) {
                    return "Order #" + dto.getBookingId() +
                            " status has been updated by " + senderName;
                }
            }
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid notification type: " + dto.getType());
        }

        // Use DTO message if available as fallback
        if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
            return dto.getMessage();
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

    public void createOrderNotification(Long userId, Long orderId, BigDecimal totalAmount, Long venueId,
            String venueName) {
        try {
            System.out.println("🚀 Creating order notifications for order #" + orderId);

            // 1. Get the customer who placed the order
            User customer = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Recipient not found with ID: " + userId));

            System.out.println("✅ Customer found: " + customer.getEmail());

            // 2. Create notification for CUSTOMER
            NotificationDTO customerNotification = new NotificationDTO();
            customerNotification.setRecipientId(userId);
            customerNotification.setSenderId(userId);
            customerNotification.setTitle("Order Placed Successfully");
            customerNotification.setType("ORDER");
            customerNotification.setMessage("Your order #" + orderId +
                    " has been placed successfully. Total: NPR " + totalAmount);
            customerNotification.setBookingId(orderId);
            customerNotification.setTotalAmount(totalAmount);
            customerNotification.setVenueId(venueId);
            customerNotification.setVenueName(venueName);

            // Create notification for customer
            createNotificationsForAllRoles(customerNotification);

            System.out.println("✅ Customer notification created for order #" + orderId);

            // 3. Create notifications for ALL ADMIN users
            List<User> allUsers = userRepository.findAll();
            for (User user : allUsers) {
                if (user.getRole() != null &&
                        (user.getRole().equalsIgnoreCase("ADMIN") ||
                                user.getRole().equalsIgnoreCase("ROLE_ADMIN"))
                        &&
                        !user.getUser_id().equals(userId)) {

                    NotificationDTO adminNotification = new NotificationDTO();
                    adminNotification.setRecipientId(user.getUser_id());
                    adminNotification.setSenderId(userId);
                    adminNotification.setTitle("📦 New Order Received");
                    adminNotification.setType("ORDER");
                    adminNotification.setBookingId(orderId);
                    adminNotification.setTotalAmount(totalAmount);
                    adminNotification.setVenueId(venueId);
                    adminNotification.setVenueName(venueName);

                    // Build the message with all details
                    String adminMessage = String.format(
                            "New order #%d placed by %s | Venue: %s | Amount: NPR %s",
                            orderId, customer.getFullname(), venueName, totalAmount);
                    adminNotification.setMessage(adminMessage);

                    createNotificationsForAllRoles(adminNotification);
                }
            }

        } catch (Exception e) {
            System.err.println("❌ Error in createOrderNotification: " + e.getMessage());
            throw e;
        }
    }

    public void createAdminStatusNotification(Long orderId, Long customerId, String customerEmail,
            String oldStatus, String newStatus, String venueName) {
        try {
            // Get all admin users
            List<User> admins = userRepository.findByRole("ROLE_ADMIN");

            for (User admin : admins) {
                NotificationDTO adminNotification = new NotificationDTO();
                adminNotification.setRecipientId(admin.getUser_id());
                adminNotification.setSenderId(customerId);
                adminNotification.setTitle("Order Status Changed");
                adminNotification.setType("ORDER_STATUS");
                adminNotification.setMessage(
                        "Order #" + orderId +
                                " status changed from '" + oldStatus +
                                "' to '" + newStatus + "'" +
                                "\nCustomer: " + customerEmail +
                                "\nVenue: " + venueName);
                adminNotification.setBookingId(orderId);

                createNotificationsForAllRoles(adminNotification);
            }

            System.out.println("✅ Admin status notifications sent for order #" + orderId);
        } catch (Exception e) {
            System.err.println("❌ Error creating admin status notification: " + e.getMessage());
        }
    }

    public void createOrderStatusNotification(Long userId, Long orderId, String status, Long venueId,
            String venueName) {
        try {
            System.out.println("🚀 Creating status notification for order #" + orderId + " - Status: " + status);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setRecipientId(userId);
            notificationDTO.setSenderId(userId);

            // Set proper title and message based on status
            String title = "";
            String message = "";

            switch (status.toLowerCase()) {
                case "processing":
                    title = "Order Processing";
                    message = "Your order #" + orderId + " is now being processed for " + venueName;
                    break;
                case "shipped":
                    title = "Order Shipped";
                    message = "Great news! Your order #" + orderId + " for " + venueName + " has been shipped!";
                    break;
                case "completed":
                    title = "Order Delivered";
                    message = "Your order #" + orderId + " for " + venueName + " has been delivered successfully!";
                    break;
                case "cancelled":
                case "canceled":
                    title = "Order Cancelled";
                    message = "Your order #" + orderId + " for " + venueName + " has been cancelled.";
                    break;
                default:
                    title = "Order Status Updated";
                    message = "Your order #" + orderId + " status has been updated to: " + status;
            }

            notificationDTO.setTitle(title);
            notificationDTO.setType("ORDER_STATUS");
            notificationDTO.setMessage(message);
            notificationDTO.setBookingId(orderId);
            notificationDTO.setVenueId(venueId);
            notificationDTO.setVenueName(venueName);

            // Create notification
            createNotificationsForAllRoles(notificationDTO);

            System.out.println("✅ Status notification created for order #" + orderId);
        } catch (Exception e) {
            System.err.println("❌ Error creating status notification: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public void createDonationNotification(Donation donation, Long userId) {
        try {
            System.out.println("🚀 Creating donation notifications for donation ID: " + donation.getDonationId());

            // 1. Create notification for DONOR (User)
            NotificationDTO donorNotification = new NotificationDTO();
            donorNotification.setRecipientId(userId);
            donorNotification.setSenderId(userId);
            donorNotification.setTitle("Donation Received");
            donorNotification.setType("DONATION_COMPLETED");
            donorNotification.setMessage(
                    "The donation is in process. Thank you for the donation, our team will contact you for the pick up");

            createNotificationsForAllRoles(donorNotification);
            System.out.println("✅ Donor notification created");

            // 2. Create notification for PARTNER
            if (donation.getProgram() != null && donation.getProgram().getPartner() != null) {
                Partner partner = donation.getProgram().getPartner();
                if (partner.getUser_id() != null) {
                    NotificationDTO partnerNotification = new NotificationDTO();
                    partnerNotification.setRecipientId(partner.getUser_id());
                    partnerNotification.setSenderId(userId);
                    partnerNotification.setTitle("New Donation for your Program");
                    partnerNotification.setType("DONATION_COMPLETED");

                    String pickupLocation = String.format("%s, %s, %s",
                            donation.getStreetAddress(),
                            donation.getCity(),
                            donation.getZipCode());

                    partnerNotification.setMessage(
                            String.format("The donation from %s has been done and the pickup location is %s",
                                    donation.getFullName(),
                                    pickupLocation));

                    createNotificationsForAllRoles(partnerNotification);
                    System.out.println("✅ Partner notification created for user ID: " + partner.getUser_id());
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error creating donation notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void createAssignedDonationNotification(Donation donation, User admin) {
        try {
            if (admin == null || admin.getUser_id() == null)
                return;

            String ngoName = "NGO";
            if (donation.getProgram() != null && donation.getProgram().getPartner() != null) {
                ngoName = donation.getProgram().getPartner().getFullname();
            }

            // 1. Notify Admin
            NotificationDTO adminNotif = new NotificationDTO();
            adminNotif.setRecipientId(admin.getUser_id());
            adminNotif.setSenderId(admin.getUser_id());
            adminNotif.setTitle("Donation Pickup Assigned");
            adminNotif.setType("PICKUP_ASSIGNED");
            adminNotif.setMessage("A donation from " + donation.getFullName() +
                    " has been assigned to you from " + ngoName + ".");
            createNotificationsForAllRoles(adminNotif);

            // 2. Notify Partner (NGO)
            if (donation.getProgram() != null && donation.getProgram().getPartner() != null) {
                Partner partner = donation.getProgram().getPartner();
                if (partner.getUser_id() != null) {
                    NotificationDTO partnerNotif = new NotificationDTO();
                    partnerNotif.setRecipientId(partner.getUser_id());
                    partnerNotif.setSenderId(admin.getUser_id());
                    partnerNotif.setTitle("Donation Assigned to Admin");
                    partnerNotif.setType("PICKUP_ASSIGNED");
                    partnerNotif.setMessage("The donation from " + donation.getFullName() +
                            " has been assigned to Admin for pickup.");
                    createNotificationsForAllRoles(partnerNotif);
                }
            }
        } catch (Exception e) {
            System.err.println("Error creating assigned donation notification: " + e.getMessage());
        }
    }

    public void createDonationStatusNotification(Donation donation, String newStatus) {
        try {
            if (donation.getProgram() != null && donation.getProgram().getPartner() != null) {
                Partner partner = donation.getProgram().getPartner();
                if (partner.getUser_id() != null) {
                    NotificationDTO notif = new NotificationDTO();
                    notif.setRecipientId(partner.getUser_id());
                    notif.setSenderId(partner.getUser_id());
                    notif.setTitle("Donation Status Updated");
                    notif.setType("DONATION_STATUS");

                    String displayStatus = newStatus.replace("_", " ").toUpperCase();
                    notif.setMessage("The donation from " + donation.getFullName() +
                            " status has been updated to: " + displayStatus);

                    createNotificationsForAllRoles(notif);
                }
            }
        } catch (Exception e) {
            System.err.println("Error creating donation status notification: " + e.getMessage());
        }
    }
}