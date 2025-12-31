package com.event.model;

public enum NotificationType {
    // Shorten the values
    BOOKING_REQUEST("BOOKING_REQ"),
    BOOKING_APPROVED("BOOKING_APPROVED"),
    BOOKING_REJECTED("BOOKING_REJECTED"),
    BOOKING_CANCELLED("BOOKING_CANCELLED"),
    PAYMENT_RECEIVED("PAYMENT_RECEIVED"),
    PAYMENT_FAILED("PAYMENT_FAILED"),
    EVENT_REMINDER("EVENT_REMINDER"),
    VENUE_UPDATE("VENUE_UPDATE"),
    SYSTEM_ANNOUNCEMENT("SYSTEM"),
    PROFILE_UPDATE_REQUIRED("PROFILE_UPDATE"),
    ORDER("ORDER"),
	 ORDER_STATUS("ORDER_STATUS"),
	 PAYMENT("PAYMENT"),
	  SYSTEM("SYSTEM"),
    ORDER_COMPLETED("ORDER_DONE"),
    ORDER_CANCELLED("ORDER_CANCEL"),
    DONATION_COMPLETED("DONATION_DONE");

    
    private final String value;
    
    NotificationType(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}