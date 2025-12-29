package com.event.repository;

import com.event.model.Cart;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepo extends JpaRepository<Cart, Long> {
    // Find cart by user
	  Optional<Cart> findByUserId(Long userId);
}
