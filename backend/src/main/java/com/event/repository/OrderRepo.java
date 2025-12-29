package com.event.repository;

import com.event.model.Order;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {
    // You can add custom queries here if needed
	
	List<Order> findByUserId(Long userId);
	
	 long countByUserId(Long userId);

//	    long countByStatus(String status);

	    long countByUserIdAndStatus(Long userId, String status);

	    // ✅ TOTAL ORDER AMOUNT (Admin dashboard)
	    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
	    BigDecimal findTotalOrderAmount();
	
	    long countByStatus(String status);

	    // ✅ Grouped status count (dashboard-friendly)
	    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
	    List<Object[]> countOrdersGroupedByStatus();
	    
	    Optional<Order> findByTransactionUuid(String transactionUuid);
}


// package com.event.repository;

// import com.event.model.Order;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
// import org.springframework.stereotype.Repository;

// import java.math.BigDecimal;
// import java.util.List;
// import java.util.Optional;

// @Repository
// public interface OrderRepo extends JpaRepository<Order, Long> {
    
//     // ========== EXISTING METHODS ==========
    
//     List<Order> findByUserId(Long userId);
    
//     long countByUserId(Long userId);
    
//     long countByUserIdAndStatus(Long userId, String status);
    
//     @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
//     BigDecimal findTotalOrderAmount();
    
//     long countByStatus(String status);
    
//     @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
//     List<Object[]> countOrdersGroupedByStatus();
    
//     Optional<Order> findByTransactionUuid(String transactionUuid);
    
//     // ========== NEW METHODS FOR MONTHLY STATISTICS ==========
    
//     /**
//      * Count orders per month for the current year
//      */
//     @Query("SELECT MONTH(o.createdAt) as month, COUNT(o) as count " +
//            "FROM Order o " +
//            "WHERE YEAR(o.createdAt) = YEAR(CURRENT_DATE) " +
//            "GROUP BY MONTH(o.createdAt) " +
//            "ORDER BY month")
//     List<Object[]> countOrdersPerMonth();
    
//     /**
//      * Sum order revenue per month for the current year
//      */
//     @Query("SELECT MONTH(o.createdAt) as month, COALESCE(SUM(o.totalAmount), 0) as revenue " +
//            "FROM Order o " +
//            "WHERE YEAR(o.createdAt) = YEAR(CURRENT_DATE) " +
//            "GROUP BY MONTH(o.createdAt) " +
//            "ORDER BY month")
//     List<Object[]> sumOrderRevenuePerMonth();
    
//     /**
//      * Get daily order count for the last 30 days
//      * Using native query for MySQL compatibility
//      */
//     @Query(value = "SELECT DATE(created_at) as date, COUNT(*) as count " +
//            "FROM orders " +
//            "WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) " +
//            "GROUP BY DATE(created_at) " +
//            "ORDER BY date", nativeQuery = true)
//     List<Object[]> getDailyOrdersLast30Days();
    
//     /**
//      * Get order statistics by payment method
//      */
//     @Query("SELECT o.paymentMethod, COUNT(o) FROM Order o GROUP BY o.paymentMethod")
//     List<Object[]> countOrdersByPaymentMethod();
    
//     /**
//      * Get average order value
//      */
//     @Query("SELECT AVG(o.totalAmount) FROM Order o")
//     BigDecimal findAverageOrderValue();
    
//     /**
//      * Get revenue by payment method
//      */
//     @Query("SELECT o.paymentMethod, COALESCE(SUM(o.totalAmount), 0) as revenue " +
//            "FROM Order o " +
//            "GROUP BY o.paymentMethod")
//     List<Object[]> sumRevenueByPaymentMethod();
    
//     /**
//      * Get order completion rate (percentage of completed orders)
//      * Using native query for better calculation
//      */
//     @Query(value = "SELECT " +
//            "ROUND((SELECT COUNT(*) FROM orders WHERE status = 'completed') * 100.0 / " +
//            "GREATEST((SELECT COUNT(*) FROM orders), 1), 2) as completionRate", 
//            nativeQuery = true)
//     Double getOrderCompletionRate();
// }