package com.event.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.event.model.Booking;
import com.event.model.Notification;
import com.event.model.NotificationStatus;
import com.event.model.NotificationType;
import com.event.model.Partner;
import com.event.model.User;
import com.event.model.Venue;


@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long> {
    
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    
    List<Notification> findByRecipientAndStatusOrderByCreatedAtDesc(User recipient, NotificationStatus status);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient = :recipient AND n.status = :status")
    Long countByRecipientAndStatus(@Param("recipient") User recipient, @Param("status") NotificationStatus status);
    
    @Modifying
    @Query("UPDATE Notification n SET n.status = :status, n.readAt = :readAt WHERE n.recipient = :recipient AND n.status = :currentStatus")
    void updateStatusByRecipientAndCurrentStatus(@Param("recipient") User recipient, 
                                               @Param("status") NotificationStatus status,
                                               @Param("readAt") LocalDateTime readAt,
                                               @Param("currentStatus") NotificationStatus currentStatus);
    
    @Query("SELECT n FROM Notification n WHERE n.recipient = :recipient AND n.type = :type ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientAndType(@Param("recipient") User recipient, @Param("type") NotificationType type);
    
    void deleteByRecipient(User recipient);
}
