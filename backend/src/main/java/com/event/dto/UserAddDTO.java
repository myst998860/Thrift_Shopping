package com.event.dto;

import java.time.LocalDateTime;

import jakarta.persistence.Column;

public class UserAddDTO {

    private Long user_id;
	 	private String email;
	    private String password;
	    private String phoneNumber;
	    private String fullname;
	    private String company;
	    private String role; 

	    private String panCard;  

	    private String businessTranscripts; 
	    private LocalDateTime joinDate;
	    
	    private String status;
	    
	    
		public Long getUser_id() {
			return user_id;
		}
		public void setUser_id(Long user_id) {
			this.user_id = user_id;
		}
		public String getEmail() {
			return email;
		}
		public void setEmail(String email) {
			this.email = email;
		}
		public String getPassword() {
			return password;
		}
		public void setPassword(String password) {
			this.password = password;
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
		public String getRole() {
			return role;
		}
		public void setRole(String role) {
			this.role = role;
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
		public LocalDateTime getJoinDate() {
			return joinDate;
		}

		public void setJoinDate(LocalDateTime joinDate) {
			this.joinDate = joinDate;
		}
		public String getStatus() {
			return status;
		}
		public void setStatus(String status) {
			this.status = status;
		}

	    
	    
}