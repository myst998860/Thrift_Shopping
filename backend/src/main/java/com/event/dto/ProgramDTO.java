package com.event.dto;

import java.time.LocalDate;
import java.util.List;

public class ProgramDTO {

    private Long programId;
    private String programTitle;
    private String description;
    private String category; // Clothing, Emergency Relief, Education, etc.
    private String programImage;
    private LocalDate startDate;
    private LocalDate endDate;
    private String programLocation;
    private String targetItemsToCollect;
    private Integer estimatedBeneficiaries;
    private String programGoal;
    private String name;       // Organizer or Partner representative name
    private String role;       // e.g., Coordinator, Partner, Volunteer
    private String objective;  // Detailed objective or mission
    private Long partnerId;    // To link program to its partner (instead of full entity)
    private List<String> tags; // Optional — program tags or keywords

    // ------------------ Constructors ------------------
    public ProgramDTO() {}

    public ProgramDTO(Long programId, String programTitle, String description, String category, String programImage,
                      LocalDate startDate, LocalDate endDate, String programLocation, String targetItemsToCollect,
                      Integer estimatedBeneficiaries, String programGoal, String name, String role,
                      String objective, Long partnerId, List<String> tags) {
        this.programId = programId;
        this.programTitle = programTitle;
        this.description = description;
        this.category = category;
        this.programImage = programImage;
        this.startDate = startDate;
        this.endDate = endDate;
        this.programLocation = programLocation;
        this.targetItemsToCollect = targetItemsToCollect;
        this.estimatedBeneficiaries = estimatedBeneficiaries;
        this.programGoal = programGoal;
        this.name = name;
        this.role = role;
        this.objective = objective;
        this.partnerId = partnerId;
        this.tags = tags;
    }

    // ------------------ Getters and Setters ------------------

    public Long getProgramId() {
        return programId;
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

    public Long getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(Long partnerId) {
        this.partnerId = partnerId;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
