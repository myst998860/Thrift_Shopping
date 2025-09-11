package com.event.model;

public enum NotificationStatus {
	  
		UNREAD("unread"),
	    READ("read"),
	    ARCHIVED("archived");
	    
	    private final String value;
	    
	    NotificationStatus(String value) {
	        this.value = value;
	    }
	    
	    public String getValue() {
	        return value;
	    }
	}