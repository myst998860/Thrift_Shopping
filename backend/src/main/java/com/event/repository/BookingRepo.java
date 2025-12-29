package com.event.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.event.model.Booking;
import com.event.model.Partner;
import com.event.model.Venue;




@Repository
public interface BookingRepo extends JpaRepository<Booking, Long> {
	
	long countByVenue_Partner(Partner partner);
		
		Optional<Booking> findById(Long id);
		
		@Query("SELECT COUNT(b) FROM Booking b WHERE b.venue.venue_id = :venueId")
		long countBookingsByVenueId(@Param("venueId") Long venueId);
		
		@Query("SELECT b FROM Booking b " +
			       "JOIN FETCH b.venue v " +
			       "LEFT JOIN FETCH v.partner " +
			       "WHERE b.attendee.user_id = :userId")
			List<Booking> findBookingsByUserId(@Param("userId") Long userId);
		
		  @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Booking b")
		    Double findTotalBookingCost();
		  
		  @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Booking b WHERE b.venue.partner = :partner")
		  Double findTotalCostByPartner(@Param("partner") Partner partner);
	}


// package com.event.repository;

// import java.util.List;
// import java.util.Optional;

// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
// import org.springframework.stereotype.Repository;

// import com.event.model.Booking;
// import com.event.model.Partner;
// import com.event.model.Venue;

// @Repository
// public interface BookingRepo extends JpaRepository<Booking, Long> {
    
//     // Existing methods
//     long countByVenue_Partner(Partner partner);
    
//     Optional<Booking> findById(Long id);
    
//     @Query("SELECT COUNT(b) FROM Booking b WHERE b.venue.venue_id = :venueId")
//     long countBookingsByVenueId(@Param("venueId") Long venueId);
    
//     @Query("SELECT b FROM Booking b " +
//            "JOIN FETCH b.venue v " +
//            "LEFT JOIN FETCH v.partner " +
//            "WHERE b.attendee.user_id = :userId")
//     List<Booking> findBookingsByUserId(@Param("userId") Long userId);
    
//     @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Booking b")
//     Double findTotalBookingCost();
    
//     @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Booking b WHERE b.venue.partner = :partner")
//     Double findTotalCostByPartner(@Param("partner") Partner partner);
    
//     // ========== FIXED METHODS FOR MONTHLY STATISTICS ==========
    
//     /**
//      * Count bookings per month for the current year
//      */
//     @Query("SELECT MONTH(b.bookedTime) as month, COUNT(b) as count " +
//            "FROM Booking b " +
//            "WHERE YEAR(b.bookedTime) = YEAR(CURRENT_DATE) " +
//            "GROUP BY MONTH(b.bookedTime) " +
//            "ORDER BY month")
//     List<Object[]> countBookingsPerMonth();
    
//     /**
//      * Count bookings per month for a specific year
//      */
//     @Query("SELECT MONTH(b.bookedTime) as month, COUNT(b) as count " +
//            "FROM Booking b " +
//            "WHERE YEAR(b.bookedTime) = :year " +
//            "GROUP BY MONTH(b.bookedTime) " +
//            "ORDER BY month")
//     List<Object[]> countBookingsPerMonthByYear(@Param("year") int year);
    
//     /**
//      * Sum booking revenue per month for the current year
//      */
//     @Query("SELECT MONTH(b.bookedTime) as month, COALESCE(SUM(b.amount), 0) as revenue " +
//            "FROM Booking b " +
//            "WHERE YEAR(b.bookedTime) = YEAR(CURRENT_DATE) " +
//            "GROUP BY MONTH(b.bookedTime) " +
//            "ORDER BY month")
//     List<Object[]> sumBookingRevenuePerMonth();
    
//     /**
//      * Sum booking revenue per month for a specific year
//      */
//     @Query("SELECT MONTH(b.bookedTime) as month, COALESCE(SUM(b.amount), 0) as revenue " +
//            "FROM Booking b " +
//            "WHERE YEAR(b.bookedTime) = :year " +
//            "GROUP BY MONTH(b.bookedTime) " +
//            "ORDER BY month")
//     List<Object[]> sumBookingRevenuePerMonthByYear(@Param("year") int year);
    
//     /**
//      * Get booking statistics for partner dashboard (current year)
//      * Using native query for DATE function compatibility
//      */
//     @Query(value = "SELECT MONTH(booked_time) as month, " +
//            "COUNT(*) as bookingCount, " +
//            "COALESCE(SUM(amount), 0) as revenue " +
//            "FROM booking " +
//            "WHERE venue_id IN (SELECT venue_id FROM venue WHERE partner_id = :partnerId) " +
//            "AND YEAR(booked_time) = YEAR(CURRENT_DATE) " +
//            "GROUP BY MONTH(booked_time) " +
//            "ORDER BY month", nativeQuery = true)
//     List<Object[]> getPartnerMonthlyStats(@Param("partnerId") Long partnerId);
    
//     /**
//      * Get daily booking count for the last 30 days
//      * Using native query for better compatibility
//      */
//     @Query(value = "SELECT DATE(booked_time) as date, COUNT(*) as count " +
//            "FROM booking " +
//            "WHERE booked_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) " +
//            "GROUP BY DATE(booked_time) " +
//            "ORDER BY date", nativeQuery = true)
//     List<Object[]> getDailyBookingsLast30Days();
    
//     /**
//      * Get booking status distribution
//      */
//     @Query("SELECT b.status, COUNT(b) FROM Booking b GROUP BY b.status")
//     List<Object[]> countBookingsByStatus();
    
//     /**
//      * Get top venues by booking count
//      */
//     @Query("SELECT v.venueName, COUNT(b) as bookingCount " +
//            "FROM Booking b JOIN b.venue v " +
//            "GROUP BY v.venue_id, v.venueName " +
//            "ORDER BY bookingCount DESC")
//     List<Object[]> getTopVenuesByBookings();
// }