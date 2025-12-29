package com.event.dto;

import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public class ProductDTO {

    private String productName;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private int quantity;
    private int quality;
    private boolean isAvailable;
    private String sku;
    private String brand;
    private String category;

    private double weight;
    private double height;
    private double width;
    private double length;

    private List<MultipartFile> images; // For image upload
    private List<String> tags;

    private double rating;
    private int totalReviews;

    public ProductDTO() {
    }

    public ProductDTO(String productName, String description, BigDecimal price, BigDecimal discountPrice,
                      int quantity, int quality, boolean isAvailable, String sku, String brand, String category,
                      double weight, double height, double width, double length,
                      List<MultipartFile> images, List<String> tags, double rating, int totalReviews) {

        this.productName = productName;
        this.description = description;
        this.price = price;
        this.discountPrice = discountPrice;
        this.quantity = quantity;
        this.quality = quality;
        this.isAvailable = isAvailable;
        this.sku = sku;
        this.brand = brand;
        this.category = category;
        this.weight = weight;
        this.height = height;
        this.width = width;
        this.length = length;
        this.images = images;
        this.tags = tags;
        this.rating = rating;
        this.totalReviews = totalReviews;
    }

    // Getters and Setters

    public String getProductName() {
        return productName;
    }
    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
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
    public void setAvailable(boolean available) {
        isAvailable = available;
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

    public double getHeight() {
        return height;
    }
    public void setHeight(double height) {
        this.height = height;
    }

    public double getWidth() {
        return width;
    }
    public void setWidth(double width) {
        this.width = width;
    }

    public double getLength() {
        return length;
    }
    public void setLength(double length) {
        this.length = length;
    }

    public List<MultipartFile> getImages() {
        return images;
    }
    public void setImages(List<MultipartFile> images) {
        this.images = images;
    }

    public List<String> getTags() {
        return tags;
    }
    public void setTags(List<String> tags) {
        this.tags = tags;
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

    @Override
    public String toString() {
        return "ProductDTO{" +
                "productName='" + productName + '\'' +
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
                ", images=" + (images != null ? images.stream()
                        .map(MultipartFile::getOriginalFilename).toList() : null) +
                ", tags=" + tags +
                ", rating=" + rating +
                ", totalReviews=" + totalReviews +
                '}';
    }
}
