package com.event.model;

import java.util.ArrayList;
import java.util.List;

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
public class Partner extends User{
	
	 @OneToMany(mappedBy = "partner", cascade = CascadeType.ALL, orphanRemoval = true)
	    private List<Venue> venues = new ArrayList<>();

	    // Getter and Setter
	    public List<Venue> getVenues() {
	        return venues;
	    }

	    public void setVenues(List<Venue> venues) {
	        this.venues = venues;
	    }

}
