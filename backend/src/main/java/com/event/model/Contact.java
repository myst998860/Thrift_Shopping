package com.event.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;

@Entity
@Table(name = "contacts")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String contactNumber;
    private String emailAddress;
    private String message;
    
    @ElementCollection
    @CollectionTable(name = "contact_images", joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();
    
    // ---------- Add createdAt here ----------
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Default constructor
    public Contact() {
    }

    // Parameterized constructor
    public Contact(String fullName, String contactNumber, String emailAddress, String message, List<String> images) {
        this.fullName = fullName;
        this.contactNumber = contactNumber;
        this.emailAddress = emailAddress;
        this.message = message;
        this.images = images;
    }
    


    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    
    @Override
    public String toString() {
        return "Contact{" +
                "id=" + id +
                ", fullName='" + fullName + '\'' +
                ", contactNumber='" + contactNumber + '\'' +
                ", emailAddress='" + emailAddress + '\'' +
                ", message='" + message + '\'' +
                ", images='" + images + '\'' +
                '}';
    }
}
