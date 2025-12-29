package com.event.dto;

import java.math.BigDecimal;

public class CartItemDTO {

	  private Long id; // CartItem id
	    private Long cartId;
	    private Long venueId;
	    private String venueName;
	    private BigDecimal price;
	    private Integer quantity;
    
// Getters & Setters
public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public Long getCartId() { return cartId; }
public void setCartId(Long cartId) { this.cartId = cartId; }

public Long getVenueId() { return venueId; }
public void setVenueId(Long venueId) { this.venueId = venueId; }

public String getVenueName() { return venueName; }
public void setVenueName(String venueName) { this.venueName = venueName; }

public BigDecimal getPrice() { return price; }
public void setPrice(BigDecimal price) { this.price = price; }

public Integer getQuantity() { return quantity; }
public void setQuantity(Integer quantity) { this.quantity = quantity; }

}
