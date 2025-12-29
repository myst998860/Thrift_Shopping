package com.event.repository;

import com.event.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem, Long> {
    // Query by user via cart
	 Optional<CartItem> findByCartIdAndVenueId(Long cartId, Long venueId);
}
