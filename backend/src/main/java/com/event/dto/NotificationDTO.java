package com.event.dto;

import java.time.LocalDateTime;

public class NotificationDTO {

	 private Long recipientId;
	    private Long senderId;
	    private String title;
	    private String message;
	    private String type;
	    private Long bookingId;
	    private Long venueId;
	    private String venueName;
	    private LocalDateTime bookedTime;


	    
	    // Constructors
	   public NotificationDTO()
	   {}
	    
	    public NotificationDTO(Long recipientId, String title, String message, String type) {
	        this.recipientId = recipientId;
	        this.title = title;
	        this.message = message;
	        this.type = type;
	    }

		public Long getRecipientId() {
			return recipientId;
		}

		public void setRecipientId(Long recipientId) {
			this.recipientId = recipientId;
		}

		public Long getSenderId() {
			return senderId;
		}

		public void setSenderId(Long senderId) {
			this.senderId = senderId;
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

		public String getVenueName() {
			return venueName;
		}

		public void setVenueName(String venueName) {
			this.venueName = venueName;
		}

		public LocalDateTime getBookedTime() {
			return bookedTime;
		}

		public void setBookedTime(LocalDateTime bookedTime) {
			this.bookedTime = bookedTime;
		}

	    
	    
	    
}


