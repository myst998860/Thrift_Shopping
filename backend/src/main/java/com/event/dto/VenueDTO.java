package com.event.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.event.model.Venue;

//public class VenueDTO {
//
//    private Long venue_id;
//    private String venueName;
//    private String location;
//    private String mapLocationUrl;
//    private BigDecimal price;
//    private Integer minBookingHours;
//    private String brand;
//    private String quality;
//    private String size;
//    private String status;
//    private String partnerName;
//    private Long partnerId;
//    private LocalTime openingTime;
//    private LocalTime closingTime;
//    private String imageUrl;
//    private String description;
//    private List<String> amenities;
//    private long bookingCount;
//    private String category;  
//
//    public VenueDTO() {}
//    
//    public VenueDTO(Long venue_id, String venueName,  
//                    BigDecimal price, String brand, String size, String quality, 
//                     String description,
//                    String status,  String imageUrl, long bookingCount,
//                    String category) {  
//        this.venue_id = venue_id;
//        this.venueName = venueName;
////        this.location = location;
//        
////        this.mapLocationUrl = mapLocationUrl;
//        this.price = price;
////        this.minBookingHours = minBookingHours;
//        this.brand = brand;
//        this.size = size;
//        this.quality = quality;
////        this.openingTime = openingTime;
////        this.closingTime = closingTime;
//        this.description = description;
////        this.amenities = amenities;
//        this.status = status;
////        this.partnerName = partnerName;
//        this.imageUrl = imageUrl;
//        this.bookingCount = bookingCount;
//        this.category = category; 
//    }
//
//    public static VenueDTO fromVenue(Venue v) {
//        long bookingCount = (v.getBookings() != null) ? v.getBookings().size() : 0;
////        String imageUrl = (v.getImageUrl() != null) ? v.getImageUrl() : "";
//        String category = (v.getCategory() != null) ? v.getCategory().toString() : "";
//
//        return new VenueDTO(
//            v.getVenue_id(),
//            v.getVenueName(),
//            v.getPrice(),
//            v.getBrand(),
//            v.getSize(),
//            v.getQuality(),
//            v.getDescription(),
//            v.getStatus(),
//            (v.getImageUrl() != null) ? v.getImageUrl() : "",
//            bookingCount,
//            category
//        );
//    }
//    // Getters and Setters
//    
//    public Long getVenue_id() {
//        return venue_id;
//    }
//
//    public void setVenue_id(Long venue_id) {
//        this.venue_id = venue_id;
//    }
//
//    public String getVenueName() {
//        return venueName;
//    }
//
//    public void setVenueName(String venueName) {
//        this.venueName = venueName;
//    }
//
//    public String getLocation() {
//        return location;
//    }
//
//    public void setLocation(String location) {
//        this.location = location;
//    }
//
//    public String getMapLocationUrl() {
//        return mapLocationUrl;
//    }
//
//    public void setMapLocationUrl(String mapLocationUrl) {
//        this.mapLocationUrl = mapLocationUrl;
//    }
//
//    public BigDecimal getPrice() {
//        return price;
//    }
//
//    public void setPrice(BigDecimal price) {
//        this.price = price;
//    }
//
//    public Integer getMinBookingHours() {
//        return minBookingHours;
//    }
//
//    public void setMinBookingHours(Integer minBookingHours) {
//        this.minBookingHours = minBookingHours;
//    }
//
//    public String getBrand() {
//        return brand;
//    }
//
//    public void setBrand(String brand) {
//        this.brand = brand;
//    }
//    public String getSize() {
//        return size;
//    }
//
//    public void setSize(String size) {
//        this.size = size;
//    }
//
//    public String getStatus() {
//        return status;
//    }
//
//    public void setStatus(String status) {
//        this.status = status;
//    }
//
//    public String getPartnerName() {
//        return partnerName;
//    }
//
//    public void setPartnerName(String partnerName) {
//        this.partnerName = partnerName;
//    }
//
//    public Long getPartnerId() {
//        return partnerId;
//    }
//
//    public void setPartnerId(Long partnerId) {
//        this.partnerId = partnerId;
//    }
//
//    public LocalTime getOpeningTime() {
//        return openingTime;
//    }
//
//    public void setOpeningTime(LocalTime openingTime) {
//        this.openingTime = openingTime;
//    }
//
//    public LocalTime getClosingTime() {
//        return closingTime;
//    }
//
//    public void setClosingTime(LocalTime closingTime) {
//        this.closingTime = closingTime;
//    }
//
//    public String getImageUrl() {
//        return imageUrl;
//    }
//
//    public void setImageUrl(String imageUrl) {
//        this.imageUrl = imageUrl;
//    }
//
//    public String getDescription() {
//        return description;
//    }
//
//    public void setDescription(String description) {
//        this.description = description;
//    }
//
//    public List<String> getAmenities() {
//        return amenities;
//    }
//
//    public void setAmenities(List<String> amenities) {
//        this.amenities = amenities;
//    }
//
//    public long getBookingCount() {
//        return bookingCount;
//    }
//
//    public void setBookingCount(long bookingCount) {
//        this.bookingCount = bookingCount;
//    }
//
//    public String getCategory() {
//        return category;
//    }
//
//    public void setCategory(String category) {
//        this.category = category;
//    }
//
//	public String getQuality() {
//		return quality;
//	}
//
//	public void setQuality(String quality) {
//		this.quality = quality;
//	}
//}

public class VenueDTO {

    private Long venue_id;
    private String venueName;
    private String partnerName;
  private Long partnerId;
    private String location;
    private String mapLocationUrl;
    private BigDecimal price;
    private Integer minBookingHours;
    private String brand;
    private String quality;
    private String size;
    private String status;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private List<String> imageUrls = new ArrayList<>();
    private String description;
    private List<String> amenities;
    private String category;

    // ✅ No-args constructor required for Jackson
    public VenueDTO() {}
    
    public static VenueDTO fromVenue(Venue v) {
        VenueDTO dto = new VenueDTO();
        dto.setVenue_id(v.getVenue_id());
        dto.setVenueName(v.getVenueName());
        dto.setPrice(v.getPrice());
        dto.setBrand(v.getBrand());
        dto.setSize(v.getSize());
        dto.setQuality(v.getQuality());
        dto.setDescription(v.getDescription());
        dto.setStatus(v.getStatus());
        dto.setImageUrls((v.getImageUrls() != null) ? v.getImageUrls() : new ArrayList<>());

        dto.setCategory((v.getCategory() != null) ? v.getCategory() : null);
        dto.setAmenities(v.getAmenities());
        dto.setMapLocationUrl(v.getMapLocationUrl());
        dto.setOpeningTime(v.getOpeningTime());
        dto.setClosingTime(v.getClosingTime());
        dto.setMinBookingHours(v.getMinBookingHours());
        dto.setLocation(v.getLocation());
        return dto;
    }

    // Getters & Setters
    public Long getVenue_id() { return venue_id; }
    public void setVenue_id(Long venue_id) { this.venue_id = venue_id; }
    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getMapLocationUrl() { return mapLocationUrl; }
    public void setMapLocationUrl(String mapLocationUrl) { this.mapLocationUrl = mapLocationUrl; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getMinBookingHours() { return minBookingHours; }
    public void setMinBookingHours(Integer minBookingHours) { this.minBookingHours = minBookingHours; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getQuality() { return quality; }
    public void setQuality(String quality) { this.quality = quality; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalTime getOpeningTime() { return openingTime; }
    public void setOpeningTime(LocalTime openingTime) { this.openingTime = openingTime; }
    public LocalTime getClosingTime() { return closingTime; }
    public void setClosingTime(LocalTime closingTime) { this.closingTime = closingTime; }
//    public String getImageUrl() { return imageUrl; }
//    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

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
}
