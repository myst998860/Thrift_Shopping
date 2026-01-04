package com.event.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;

@Entity
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long donationId;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.setCreatedAt(LocalDateTime.now());
    }

    private String status;

    // Personal Information
    private String fullName;
    private String email;
    private String phoneNumber;

    // Address
    private String streetAddress;
    private String city;
    private String zipCode;

    // Clothing Details
    private boolean shirtsAndTops;
    private boolean dressesAndSkirts;
    private boolean shoes;
    private boolean pantsAndJeans;
    private boolean jacketsAndCoats;
    private boolean accessories;
    private boolean childrensClothing;
    private boolean undergarments;

    private String estimatedQuantity; // e.g. "1-5 items", "6-15 items"
    private String overallCondition; // e.g. "New", "Good", "Fair"
    private String description;

    // Pickup Details
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate preferredPickupDate;

    private String pickupInstructions;

    // Getters & Setters
    public Long getDonationId() {
        return donationId;
    }

    public void setDonationId(Long donationId) {
        this.donationId = donationId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getStreetAddress() {
        return streetAddress;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public boolean isShirtsAndTops() {
        return shirtsAndTops;
    }

    public void setShirtsAndTops(boolean shirtsAndTops) {
        this.shirtsAndTops = shirtsAndTops;
    }

    public boolean isDressesAndSkirts() {
        return dressesAndSkirts;
    }

    public void setDressesAndSkirts(boolean dressesAndSkirts) {
        this.dressesAndSkirts = dressesAndSkirts;
    }

    public boolean isShoes() {
        return shoes;
    }

    public void setShoes(boolean shoes) {
        this.shoes = shoes;
    }

    public boolean isPantsAndJeans() {
        return pantsAndJeans;
    }

    public void setPantsAndJeans(boolean pantsAndJeans) {
        this.pantsAndJeans = pantsAndJeans;
    }

    public boolean isJacketsAndCoats() {
        return jacketsAndCoats;
    }

    public void setJacketsAndCoats(boolean jacketsAndCoats) {
        this.jacketsAndCoats = jacketsAndCoats;
    }

    public boolean isAccessories() {
        return accessories;
    }

    public void setAccessories(boolean accessories) {
        this.accessories = accessories;
    }

    public boolean isChildrensClothing() {
        return childrensClothing;
    }

    public void setChildrensClothing(boolean childrensClothing) {
        this.childrensClothing = childrensClothing;
    }

    public boolean isUndergarments() {
        return undergarments;
    }

    public void setUndergarments(boolean undergarments) {
        this.undergarments = undergarments;
    }

    public String getEstimatedQuantity() {
        return estimatedQuantity;
    }

    public void setEstimatedQuantity(String estimatedQuantity) {
        this.estimatedQuantity = estimatedQuantity;
    }

    public String getOverallCondition() {
        return overallCondition;
    }

    public void setOverallCondition(String overallCondition) {
        this.overallCondition = overallCondition;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getPreferredPickupDate() {
        return preferredPickupDate;
    }

    public void setPreferredPickupDate(LocalDate preferredPickupDate) {
        this.preferredPickupDate = preferredPickupDate;
    }

    public String getPickupInstructions() {
        return pickupInstructions;
    }

    public void setPickupInstructions(String pickupInstructions) {
        this.pickupInstructions = pickupInstructions;
    }

    @ManyToOne
    @JoinColumn(name = "program_id")
    @JsonBackReference
    private Program program; // The program this donation is for

    // Getters and setters for program
    public Program getProgram() {
        return program;
    }

    public void setProgram(Program program) {
        this.program = program;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @ManyToOne
    @JoinColumn(name = "assigned_admin_id")
    private User assignedAdmin;

    private Double pickupFee;

    public User getAssignedAdmin() {
        return assignedAdmin;
    }

    public void setAssignedAdmin(User assignedAdmin) {
        this.assignedAdmin = assignedAdmin;
    }

    public Double getPickupFee() {
        return pickupFee;
    }

    public void setPickupFee(Double pickupFee) {
        this.pickupFee = pickupFee;
    }
}
