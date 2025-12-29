package com.event.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.event.model.CartItem;
import com.fasterxml.jackson.annotation.JsonBackReference;
@Entity
@Table(name = "cart")
public class Cart {

	  @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    private Long userId;

	    private LocalDateTime createdAt = LocalDateTime.now();

	    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
	    @JsonBackReference
	    private List<CartItem> items = new ArrayList<>();
    // --- Getters & Setters ---
    public Long getId() {
        return id;
    }
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	  public List<CartItem> getItems() {
	        return items;
	    }

	    public void setItems(List<CartItem> items) {
	        this.items = items;
	    }
}
