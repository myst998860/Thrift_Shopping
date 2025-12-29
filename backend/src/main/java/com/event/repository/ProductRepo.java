package com.event.repository;

import com.event.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {

    // Custom queries if needed
    List<Product> findByCategory(String category);
    List<Product> findByBrand(String brand);
    List<Product> findByIsAvailableTrue();
}
