package com.event.model;

import jakarta.persistence.Column;

import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.Table;
import jakarta.persistence.InheritanceType;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;


@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "user_type")
@Table(name = "user")
public abstract class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long user_id;

    private String password;

    private String phoneNumber;

    private String fullname;

    private String company;  

    private String panCard;  

    private String businessTranscripts; 

    private String role;
    
    private LocalDateTime joinDate;
    
    private String status;
    
    private String otpCode;
    
    private LocalDateTime otpExpiry;
    
    @Column(name = "user_type", insertable = false, updatable = false)
    private String userType;

    public String getUserType() {
        return userType;
    }
    
    

    @Column(unique = true, nullable = false)
    private String email;

  

    public Long getUser_id() {
        return user_id;
    }

    public void setUser_id(Long user_id) {
        this.user_id = user_id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getPanCard() {
        return panCard;
    }

    public void setPanCard(String panCard) {
        this.panCard = panCard;
    }

    public String getBusinessTranscripts() {
        return businessTranscripts;
    }

    public void setBusinessTranscripts(String businessTranscripts) {
        this.businessTranscripts = businessTranscripts;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

	public LocalDateTime getJoinDate() {
		return joinDate;
	}

	public void setJoinDate(LocalDateTime joinDate) {
		this.joinDate = joinDate;
	}
	
	 public String getJoinDateFormatted() {
	        if (joinDate == null) return null;
	        return joinDate.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
	    }

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public void setUserType(String userType) {
		this.userType = userType;
	}

	public LocalDateTime getOtpExpiry() {
		return otpExpiry;
	}

	public void setOtpExpiry(LocalDateTime otpExpiry) {
		this.otpExpiry = otpExpiry;
	}

	public String getOtpCode() {
		return otpCode;
	}

	public void setOtpCode(String otpCode) {
		this.otpCode = otpCode;
	}
	
	

	
}
