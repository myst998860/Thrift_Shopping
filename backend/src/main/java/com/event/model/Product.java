package com.event.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long product_id;

    private String productName;

    @Column(length = 2000)
    private String description;

    private BigDecimal price;

    private BigDecimal discountPrice;

    private int quantity;
    
    private int quality;

    private boolean isAvailable;

    private String sku; // Stock keeping unit

    private String brand;

    private String category;

   

    private double weight; // in kg
    private double height; // in cm
    private double width;  // in cm
    private double length; // in cm

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @ElementCollection
    private List<String> tags; // useful for search and filtering

    private double rating; // average user rating

    private int totalReviews;

    // Constructors, getters, setters

    public Product() {
        this.setCreatedAt(LocalDateTime.now());
        this.setUpdatedAt(LocalDateTime.now());
    }

    @PreUpdate
    public void preUpdate() {
        this.setUpdatedAt(LocalDateTime.now());
    }

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public String getDescription() {
		return productName;
	}

	public void setDescription(String Description) {
		this.description = Description;
	}
	
	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public BigDecimal getDiscountPrice() {
		return discountPrice;
	}

	public void setDiscountPrice(BigDecimal discountPrice) {
		this.discountPrice = discountPrice;
	}

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	public int getQuality() {
		return quality;
	}

	public void setQuality(int quality) {
		this.quality = quality;
	}

	public boolean isAvailable() {
		return isAvailable;
	}

	public void setAvailable(boolean isAvailable) {
		this.isAvailable = isAvailable;
	}

	public String getSku() {
		return sku;
	}

	public void setSku(String sku) {
		this.sku = sku;
	}

	public String getBrand() {
		return brand;
	}

	public void setBrand(String brand) {
		this.brand = brand;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public double getWeight() {
		return weight;
	}

	public void setWeight(double weight) {
		this.weight = weight;
	}

	public double getWidth() {
		return width;
	}

	public void setWidth(double width) {
		this.width = width;
	}

	public double getHeight() {
		return height;
	}

	public void setHeight(double height) {
		this.height = height;
	}

	public double getLength() {
		return length;
	}

	public void setLength(double length) {
		this.length = length;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public double getRating() {
		return rating;
	}

	public void setRating(double rating) {
		this.rating = rating;
	}

	public int getTotalReviews() {
		return totalReviews;
	}

	public void setTotalReviews(int totalReviews) {
		this.totalReviews = totalReviews;
	}

	
	 public List<String> getImages() {
	       return images;
	    }
	
	public void setImages(List<String> images) {
	        this.images = images;
	    }
	 
	 @Override
	 public String toString() {
	     return "Product{" +
	             "product_id=" + product_id +
	             ", productName='" + productName + '\'' +
	             ", description='" + description + '\'' +
	             ", price=" + price +
	             ", discountPrice=" + discountPrice +
	             ", quantity=" + quantity +
	             ", quality=" + quality +
	             ", isAvailable=" + isAvailable +
	             ", sku='" + sku + '\'' +
	             ", brand='" + brand + '\'' +
	             ", category='" + category + '\'' +
	             ", weight=" + weight +
	             ", height=" + height +
	             ", width=" + width +
	             ", length=" + length +
	             ", createdAt=" + createdAt +
	             ", updatedAt=" + updatedAt +
	             ", images=" + images +
	             ", tags=" + tags +
	             ", rating=" + rating +
	             ", totalReviews=" + totalReviews +
	             '}';
	 }
	
	
	

    // Getters and setters omitted for brevity
}