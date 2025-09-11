package com.event.model;

public enum NotificationType {

	 BOOKING_REQUEST("booking_request"),
	    BOOKING_APPROVED("booking_approved"),
	    BOOKING_REJECTED("booking_rejected"),
	    BOOKING_CANCELLED("booking_cancelled"),
	    PAYMENT_RECEIVED("payment_received"),
	    PAYMENT_FAILED("payment_failed"),
	    EVENT_REMINDER("event_reminder"),
	    VENUE_UPDATE("venue_update"),
	    SYSTEM_ANNOUNCEMENT("system_announcement"),
	    PROFILE_UPDATE_REQUIRED("profile_update_required");
	    
	    private final String value;
	    
	    NotificationType(String value) {
	        this.value = value;
	    }
	    
	    public String getValue() {
	        return value;
	    }
	}