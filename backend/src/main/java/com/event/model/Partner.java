package com.event.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@DiscriminatorValue("PARTNER")
@PrimaryKeyJoinColumn(name = "user_id")
@Table(name = "partner")



public class Partner extends User {
	
	  // Store URLs of uploaded documents (from Cloudinary)
    private String businessTranscripts;
    
    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // research on this line
    private List<Program> programs = new ArrayList<>();

    @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Venue> venues = new ArrayList<>();

    
    // -----------------------------
    // Getters and Setters
    // -----------------------------
    
  

    public String getbusinessTranscripts() {
        return businessTranscripts;
    }

    public void setbusinessTranscripts(String businessTranscripts) {
        this.businessTranscripts = businessTranscripts;
    }
    
    
    
    // Getters and Setters
    public List<Program> getPrograms() {
        return programs;
    }

    public void setPrograms(List<Program> programs) {
        this.programs = programs;
    }

    public List<Venue> getVenues() {
        return venues;
    }

    public void setVenues(List<Venue> venues) {
        this.venues = venues;
    }
}
