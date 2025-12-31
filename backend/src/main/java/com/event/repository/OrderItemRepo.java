package com.event.repository;

import com.event.model.Order;
import com.event.model.OrderItem;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepo extends JpaRepository<OrderItem, Long> {
    // Additional queries can be added if needed
	
	 List<OrderItem> findByOrder(Order order);
	 
	  List<OrderItem> findByOrderOrderId(Long orderId);
	  
	  
}
