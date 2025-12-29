package com.event.dto;

import org.springframework.web.multipart.MultipartFile;

public class ContactDTO {

    private String fullName;
    private String contactNumber;
    private String emailAddress;
    private String message;
    private MultipartFile image; // For uploading image

    // Default constructor
    public ContactDTO() {
    }

    // Parameterized constructor
    public ContactDTO(String fullName, String contactNumber, String emailAddress, String message, MultipartFile image) {
        this.fullName = fullName;
        this.contactNumber = contactNumber;
        this.emailAddress = emailAddress;
        this.message = message;
        this.image = image;
    }

    // Getters and Setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }

    @Override
    public String toString() {
        return "ContactDTO{" +
                "fullName='" + fullName + '\'' +
                ", contactNumber='" + contactNumber + '\'' +
                ", emailAddress='" + emailAddress + '\'' +
                ", message='" + message + '\'' +
                ", image=" + (image != null ? image.getOriginalFilename() : null) +
                '}';
    }
}
