package com.event.model;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class Program {

    public enum ProgramStatus {
        PENDING,
        ACTIVE,
        COMPLETED,
        CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long programId;

    private String programTitle;

    @Column(length = 2000)
    private String description;

    private String category;
    // Example: "Clothing", "Emergency Relief", "Education", "Seasonal",
    // "Community", "Other"

    @Lob
    @Column(columnDefinition = "TEXT")
    private String programImage; // URL or Base64 image

    private String mapLocationUrl;
    private LocalDate startDate;
    private LocalDate endDate;

    private String programLocation;

    private String targetItemsToCollect; // e.g., “Winter coats, blankets”
    private Integer estimatedBeneficiaries; // e.g., number of people expected to benefit

    private Integer itemsCollected = 0; // Dynamic count of items collected
    private Integer peopleHelped = 0; // Dynamic count of people helped

    private String programGoal; // e.g., “Collect 500 clothing items for winter drive”

    private String name; // program creator’s name or representative
    private String role; // e.g., “Coordinator”, “Partner”, “Volunteer”

    @Column(length = 2000)
    private String objective; // detailed objective or purpose of the program

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "partner_id")
    @JsonBackReference
    private Partner partner;

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // research on this line
    private List<Donation> donations; // Optional, if you want to track donations

    @ElementCollection
    private List<String> tags; // optional: to store small tags like "relief", "education", etc.

    @Enumerated(EnumType.STRING)
    private ProgramStatus status;

    // ------------------ Getters and Setters ------------------

    public ProgramStatus getStatus() {
        return status;
    }

    public void setStatus(ProgramStatus status) {
        this.status = status;
    }

    public Long getProgramId() {
        return programId;
    }

    public void setProgram_image(String program_image) {
        this.programImage = program_image;
    }

    public void setProgramId(Long programId) {
        this.programId = programId;
    }

    public String getProgramTitle() {
        return programTitle;
    }

    public void setProgramTitle(String programTitle) {
        this.programTitle = programTitle;
    }

    public Partner getPartner() {
        return partner;
    }

    public void setPartner(Partner partner) {
        this.partner = partner;
    }

    public List<Donation> getDonations() {
        return donations;
    }

    public void setDonations(List<Donation> donations) {
        this.donations = donations;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getProgramImage() {
        return programImage;
    }

    public void setProgramImage(String programImage) {
        this.programImage = programImage;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getProgramLocation() {
        return programLocation;
    }

    public void setProgramLocation(String programLocation) {
        this.programLocation = programLocation;
    }

    public String getTargetItemsToCollect() {
        return targetItemsToCollect;
    }

    public void setTargetItemsToCollect(String targetItemsToCollect) {
        this.targetItemsToCollect = targetItemsToCollect;
    }

    public Integer getEstimatedBeneficiaries() {
        return estimatedBeneficiaries;
    }

    public void setEstimatedBeneficiaries(Integer estimatedBeneficiaries) {
        this.estimatedBeneficiaries = estimatedBeneficiaries;
    }

    public String getProgramGoal() {
        return programGoal;
    }

    public void setProgramGoal(String programGoal) {
        this.programGoal = programGoal;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getObjective() {
        return objective;
    }

    public void setObjective(String objective) {
        this.objective = objective;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getMapLocationUrl() {
        return mapLocationUrl;
    }

    public void setMapLocationUrl(String mapLocationUrl) {
        this.mapLocationUrl = mapLocationUrl;
    }

    public Integer getItemsCollected() {
        return itemsCollected;
    }

    public void setItemsCollected(Integer itemsCollected) {
        this.itemsCollected = itemsCollected;
    }

    public Integer getPeopleHelped() {
        return peopleHelped;
    }

    public void setPeopleHelped(Integer peopleHelped) {
        this.peopleHelped = peopleHelped;
    }
}
