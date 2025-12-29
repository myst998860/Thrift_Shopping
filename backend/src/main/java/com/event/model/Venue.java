package com.event.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
@Entity
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long venue_id;

    private String venueName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = true)
    
    private Partner partner;

    private String location;
    
    private String quality;

    private String brand;
    
    private String size;

    private BigDecimal price;

    private String category;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings = new ArrayList<>();

    private String status;
    
    @Lob
    @Column(columnDefinition = "TEXT")
//    private String imageUrl;
    
    private String mapLocationUrl;
    private Integer minBookingHours;
    private LocalTime openingTime;
    private LocalTime closingTime;
    @Column(length = 2000)
    private String description;
    @ElementCollection
    private List<String> amenities;
    @ElementCollection
    private List<String> imageUrls = new ArrayList<>();
    
    private LocalDateTime joinDate;

    @PrePersist
    public void prePersist() {
        if (joinDate == null) {
            joinDate = LocalDateTime.now();
        }
    }
    
    public LocalDateTime getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(LocalDateTime joinDate) {
        this.joinDate = joinDate;
    }
    

    // Getters and setters

    public Long getVenue_id() {
        return venue_id;
    }

    public void setVenue_id(Long venue_id) {
        this.venue_id = venue_id;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public Partner getPartner() {
        return partner;
    }

    public void setPartner(Partner partner) {
        this.partner = partner;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

  

    public List<Booking> getBookings() {
		return bookings;
	}

	public void setBookings(List<Booking> bookings) {
		this.bookings = bookings;
	}

	public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

//	public String getImageUrl() {
//		return imageUrl;
//	}
//
//	public void setImageUrl(String imageUrl) {
//		this.imageUrl = imageUrl;
//	}

	public List<String> getImageUrls() {
	    return imageUrls;
	}

	public void setImageUrls(List<String> imageUrls) {
	    this.imageUrls = imageUrls;
	}
	public String getMapLocationUrl() {
		return mapLocationUrl;
	}

	public void setMapLocationUrl(String mapLocationUrl) {
		this.mapLocationUrl = mapLocationUrl;
	}

	

	public Integer getMinBookingHours() {
		return minBookingHours;
	}

	public void setMinBookingHours(Integer minBookingHours) {
		this.minBookingHours = minBookingHours;
	}

	public LocalTime getOpeningTime() {
		return openingTime;
	}

	public void setOpeningTime(LocalTime openingTime) {
		this.openingTime = openingTime;
	}

	public LocalTime getClosingTime() {
		return closingTime;
	}

	public void setClosingTime(LocalTime closingTime) {
		this.closingTime = closingTime;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public List<String> getAmenities() {
		return amenities;
	}

	public void setAmenities(List<String> amenities) {
		this.amenities = amenities;
	}
    
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

	public String getQuality() {
		return quality;
	}

	public void setQuality(String quality) {
		this.quality = quality;
	}

	public String getSize() {
		return size;
	}

	public void setSize(String size) {
		this.size = size;
	}
    
    
}
