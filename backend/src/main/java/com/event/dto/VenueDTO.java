package com.event.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.event.model.Venue;

public class VenueDTO {

    private Long venue_id;
    private String venueName;
    private String location;
    private String mapLocationUrl;
    private BigDecimal price;
    private Integer minBookingHours;
    private String capacity;
    private String status;
    private String partnerName;
    private Long partnerId;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String imageUrl;
    private String description;
    private List<String> amenities;
    private long bookingCount;
    private String category;  

    public VenueDTO(Long venue_id, String venueName, String location, String mapLocationUrl,
                    BigDecimal price, Integer minBookingHours, String capacity, LocalTime openingTime,
                    LocalTime closingTime, String description, List<String> amenities,
                    String status, String partnerName, String imageUrl, long bookingCount,
                    String category) {  
        this.venue_id = venue_id;
        this.venueName = venueName;
        this.location = location;
        this.mapLocationUrl = mapLocationUrl;
        this.price = price;
        this.minBookingHours = minBookingHours;
        this.capacity = capacity;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
        this.description = description;
        this.amenities = amenities;
        this.status = status;
        this.partnerName = partnerName;
        this.imageUrl = imageUrl;
        this.bookingCount = bookingCount;
        this.category = category; 
    }

    public static VenueDTO fromVenue(Venue v) {
        long bookingCount = (v.getBookings() != null) ? v.getBookings().size() : 0;
        return new VenueDTO(
            v.getVenue_id(),
            v.getVenueName(),
            v.getLocation(),
            v.getMapLocationUrl(),
            v.getPrice(),
            v.getMinBookingHours(),
            v.getCapacity(),
            v.getOpeningTime(),
            v.getClosingTime(),
            v.getDescription(),
            v.getAmenities() != null ? new ArrayList<>(v.getAmenities()) : Collections.emptyList(),
            v.getStatus(),
            v.getPartner() != null ? v.getPartner().getFullname() : "Unknown",
            v.getImageUrl() != null ? v.getImageUrl() : "",
            bookingCount,
            v.getCategory()  
        );
    }

    // Getters and Setters
    
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getMapLocationUrl() {
        return mapLocationUrl;
    }

    public void setMapLocationUrl(String mapLocationUrl) {
        this.mapLocationUrl = mapLocationUrl;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getMinBookingHours() {
        return minBookingHours;
    }

    public void setMinBookingHours(Integer minBookingHours) {
        this.minBookingHours = minBookingHours;
    }

    public String getCapacity() {
        return capacity;
    }

    public void setCapacity(String capacity) {
        this.capacity = capacity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public Long getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(Long partnerId) {
        this.partnerId = partnerId;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
