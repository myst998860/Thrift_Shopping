package com.event.dto;

import java.time.LocalDateTime;
import com.event.model.Notification;



public class NotificationResponseDTO {
	

	  private Long id;
	    private String title;
	    private String message;
	    private String type;
	    private String status;
	    private Long bookingId;
	    private Long venueId;
	    private LocalDateTime createdAt;
	    private LocalDateTime readAt;
	    private String senderName;
	    
	    private String partnerName;
	    private String partnerEmail;
	    
	    // Constructor
	    public NotificationResponseDTO(Notification notification) {
	        this.id = notification.getId();
	        this.title = notification.getTitle();
	        this.message = notification.getMessage();
	        this.type = notification.getType().getValue();
	        this.status = notification.getStatus().getValue();
	        this.bookingId = notification.getBookingId();
	        this.venueId = notification.getVenueId();
	        this.createdAt = notification.getCreatedAt();
	        this.readAt = notification.getReadAt();
	        this.senderName = notification.getSender() != null ? notification.getSender().getFullname() : null;
	        
	        
	    }

		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public String getTitle() {
			return title;
		}

		public void setTitle(String title) {
			this.title = title;
		}

		public String getMessage() {
			return message;
		}

		public void setMessage(String message) {
			this.message = message;
		}

		public String getType() {
			return type;
		}

		public void setType(String type) {
			this.type = type;
		}

		public String getStatus() {
			return status;
		}

		public void setStatus(String status) {
			this.status = status;
		}

		public Long getBookingId() {
			return bookingId;
		}

		public void setBookingId(Long bookingId) {
			this.bookingId = bookingId;
		}

		public Long getVenueId() {
			return venueId;
		}

		public void setVenueId(Long venueId) {
			this.venueId = venueId;
		}

		public LocalDateTime getCreatedAt() {
			return createdAt;
		}

		public void setCreatedAt(LocalDateTime createdAt) {
			this.createdAt = createdAt;
		}

		public LocalDateTime getReadAt() {
			return readAt;
		}

		public void setReadAt(LocalDateTime readAt) {
			this.readAt = readAt;
		}

		public String getSenderName() {
			return senderName;
		}

		public void setSenderName(String senderName) {
			this.senderName = senderName;
		}

	

		public String getPartnerName() {
			return partnerName;
		}

		public void setPartnerName(String partnerName) {
			this.partnerName = partnerName;
		}

		public String getPartnerEmail() {
			return partnerEmail;
		}

		public void setPartnerEmail(String partnerEmail) {
			this.partnerEmail = partnerEmail;
		}
	    
	    
	    
	    
}