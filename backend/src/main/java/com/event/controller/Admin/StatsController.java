package com.event.controller.Admin;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.event.model.Partner;
import com.event.repository.BookingRepo;
import com.event.repository.PartnerRepo;
import com.event.repository.UserRepo;
import com.event.repository.VenueRepo;

@RestController
@RequestMapping("/api")

public class StatsController {
	
	    @Autowired private UserRepo userRepo;
	    @Autowired private PartnerRepo partnerRepo;
	    @Autowired private VenueRepo venueRepo;
	    @Autowired private BookingRepo bookingRepo;

//	    @GetMapping
//	    public Map<String, Object> stats() {
//	        long users = userRepo.count();
//	        long partners = partnerRepo.count();
//	        long venues = venueRepo.count();
//	        long bookings = bookingRepo.count();
////	        Double revenue = bookingRepo.sumTotalAmount(); // implement this query
//
//	        return Map.of(
//	          "users", users,
//	          "partners", partners,
//	          "venues", venues,
//	          "bookings", bookings
////	          "revenue", revenue
//	        );
//	   
	    
	    @GetMapping("/stats")
	    public Map<String, Object> stats(Authentication authentication) {
	    	   boolean isAdmin = authentication.getAuthorities().stream()
	    	       .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

	    	   if (isAdmin) {
	    	       // Only count users with user_type in ('ADMIN', 'USER', 'PARTNER')
	    		   long users = userRepo.countByUserTypeIn(List.of("ADMIN", "USER", "PARTNER"));
	    	       long partners = partnerRepo.count();
	    	       long venues = venueRepo.count();
	    	       long bookings = bookingRepo.count();
	    	       
	    	       Double revenueValue = bookingRepo.findTotalBookingCost();
	    	        long revenue = revenueValue != null ? revenueValue.longValue() : 0L;
	    	       

	    	        return Map.of(
	    	                "users", users,
	    	                "partners", partners,
	    	                "venues", venues,
	    	                "bookings", bookings,
	    	                "revenue", revenue
	    	            );
	    	        } else {
	    	            String email = authentication.getName();
	    	            Partner partner = partnerRepo.findByEmail(email)
	    	                .orElseThrow(() -> new RuntimeException("Partner not found"));

	    	            long partnerVenues = venueRepo.countByPartner(partner);
	    	            long partnerBookings = bookingRepo.countByVenue_Partner(partner);

	    	            Double partnerRevenueValue = bookingRepo.findTotalCostByPartner(partner);
	    	            long partnerRevenue = partnerRevenueValue != null ? partnerRevenueValue.longValue() : 0L;

	    	            return Map.of(
	    	                "users", 0,
	    	                "partners", 0,
	    	                "venues", partnerVenues,
	    	                "bookings", partnerBookings,
	    	                "revenue", partnerRevenue
	    	            );
	    	        }
	    	    }

	    @GetMapping("/chart-data")
	    public Map<String, Object> getChartData(Authentication authentication) {
	        boolean isAdmin = authentication.getAuthorities().stream()
	            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

	        if (!isAdmin) {
	            return Map.of("error", "Access denied");
	        }

	        // Generate mock data for the last 12 months
	        List<Map<String, Object>> usersData = new ArrayList<>();
	        List<Map<String, Object>> partnersData = new ArrayList<>();
	        List<Map<String, Object>> venuesData = new ArrayList<>();
	        List<Map<String, Object>> bookingsData = new ArrayList<>();

	        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
	        
	        for (int i = 0; i < 12; i++) {
	            // Users data
	            Map<String, Object> userMonth = new HashMap<>();
	            userMonth.put("month", months[i]);
	            userMonth.put("users", 20 + (i * 5) + (int)(Math.random() * 10));
	            userMonth.put("growth", (int)(Math.random() * 20) - 10);
	            usersData.add(userMonth);

	            // Partners data
	            Map<String, Object> partnerMonth = new HashMap<>();
	            partnerMonth.put("month", months[i]);
	            partnerMonth.put("partners", 10 + (i * 3) + (int)(Math.random() * 8));
	            partnerMonth.put("growth", (int)(Math.random() * 15) - 8);
	            partnersData.add(partnerMonth);

	            // Venues data
	            Map<String, Object> venueMonth = new HashMap<>();
	            venueMonth.put("month", months[i]);
	            venueMonth.put("venues", 15 + (i * 4) + (int)(Math.random() * 12));
	            venueMonth.put("growth", (int)(Math.random() * 18) - 9);
	            venuesData.add(venueMonth);

	            // Bookings data
	            Map<String, Object> bookingMonth = new HashMap<>();
	            bookingMonth.put("month", months[i]);
	            bookingMonth.put("bookings", 50 + (i * 8) + (int)(Math.random() * 20));
	            bookingMonth.put("revenue", 20000 + (i * 5000) + (int)(Math.random() * 10000));
	            bookingsData.add(bookingMonth);
	        }

	        Map<String, Object> response = new HashMap<>();
	        response.put("users", usersData);
	        response.put("partners", partnersData);
	        response.put("venues", venuesData);
	        response.put("bookings", bookingsData);

	        return response;
	    }
}