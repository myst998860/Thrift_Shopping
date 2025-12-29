package com.event.controller.Admin;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.math.BigDecimal;
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
import com.event.repository.OrderRepo;
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
	    @Autowired private OrderRepo orderRepo;

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

	            long users = userRepo.countByUserTypeIn(List.of("ADMIN", "USER", "PARTNER"));
	            long partners = partnerRepo.count();
	            long venues = venueRepo.count();
	            long bookings = bookingRepo.count();
	            long orders = orderRepo.count();

	            Double bookingRevenueValue = bookingRepo.findTotalBookingCost();
	            long bookingRevenue = bookingRevenueValue != null ? bookingRevenueValue.longValue() : 0L;

	            BigDecimal orderRevenueValue = orderRepo.findTotalOrderAmount();
	            long orderRevenue = orderRevenueValue != null ? orderRevenueValue.longValue() : 0L;

	            Map<String, Long> orderStatusCounts = new HashMap<>();
	            for (Object[] row : orderRepo.countOrdersGroupedByStatus()) {
	                orderStatusCounts.put(
	                    row[0].toString().toLowerCase(),
	                    (Long) row[1]
	                );
	            }

	            Map<String, Object> response = new HashMap<>();
	            response.put("users", users);
	            response.put("partners", partners);
	            response.put("venues", venues);
	            response.put("bookings", bookings);
	            response.put("orders", orders);
	            response.put("bookingRevenue", bookingRevenue);
	            response.put("orderRevenue", orderRevenue);
	            response.put("orderStatus", orderStatusCounts);

	            return response; // ✅ REQUIRED
	        } else {
	            String email = authentication.getName();
	            Partner partner = partnerRepo.findByEmail(email)
	                .orElseThrow(() -> new RuntimeException("Partner not found"));

	            long partnerBookings = bookingRepo.countByVenue_Partner(partner);

	            Double partnerRevenueValue = bookingRepo.findTotalCostByPartner(partner);
	            long partnerRevenue = partnerRevenueValue != null ? partnerRevenueValue.longValue() : 0L;

	            return Map.of(
	                "users", 0,
	                "partners", 0,
	                "bookings", partnerBookings,
	                "bookingRevenue", partnerRevenue
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


// package com.event.controller.Admin;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.core.Authentication;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.event.model.Partner;
// import com.event.repository.BookingRepo;
// import com.event.repository.OrderRepo;
// import com.event.repository.PartnerRepo;
// import com.event.repository.UserRepo;
// import com.event.repository.VenueRepo;

// import java.time.LocalDate;
// import java.time.YearMonth;
// import java.time.format.DateTimeFormatter;
// import java.util.*;
// import java.math.BigDecimal;

// @RestController
// @RequestMapping("/api")
// public class StatsController {
    
//     @Autowired private UserRepo userRepo;
//     @Autowired private PartnerRepo partnerRepo;
//     @Autowired private VenueRepo venueRepo;
//     @Autowired private BookingRepo bookingRepo;
//     @Autowired private OrderRepo orderRepo;
    
//     private static final String[] MONTHS = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", 
//                                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
    
//     @GetMapping("/stats")
//     public Map<String, Object> stats(Authentication authentication) {
//         boolean isAdmin = authentication.getAuthorities().stream()
//             .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

//         if (isAdmin) {
//             // Admin dashboard
//             long users = userRepo.countByUserTypeIn(List.of("ADMIN", "USER", "PARTNER"));
//             long partners = partnerRepo.count();
//             long venues = venueRepo.count();
//             long bookings = bookingRepo.count();
//             long orders = orderRepo.count();

//             Double bookingRevenueValue = bookingRepo.findTotalBookingCost();
//             long bookingRevenue = bookingRevenueValue != null ? bookingRevenueValue.longValue() : 0L;

//             BigDecimal orderRevenueValue = orderRepo.findTotalOrderAmount();
//             long orderRevenue = orderRevenueValue != null ? orderRevenueValue.longValue() : 0L;

//             Map<String, Long> orderStatusCounts = new HashMap<>();
//             for (Object[] row : orderRepo.countOrdersGroupedByStatus()) {
//                 orderStatusCounts.put(
//                     row[0].toString().toLowerCase(),
//                     (Long) row[1]
//                 );
//             }

//             Map<String, Object> response = new HashMap<>();
//             response.put("users", users);
//             response.put("partners", partners);
//             response.put("venues", venues);
//             response.put("bookings", bookings);
//             response.put("orders", orders);
//             response.put("bookingRevenue", bookingRevenue);
//             response.put("orderRevenue", orderRevenue);
//             response.put("orderStatus", orderStatusCounts);

//             return response;
//         } else {
//             // Partner dashboard
//             String email = authentication.getName();
//             Partner partner = partnerRepo.findByEmail(email)
//                 .orElseThrow(() -> new RuntimeException("Partner not found"));

//             long partnerBookings = bookingRepo.countByVenue_Partner(partner);
//             Double partnerRevenueValue = bookingRepo.findTotalCostByPartner(partner);
//             long partnerRevenue = partnerRevenueValue != null ? partnerRevenueValue.longValue() : 0L;

//             return Map.of(
//                 "users", 0,
//                 "partners", 0,
//                 "bookings", partnerBookings,
//                 "bookingRevenue", partnerRevenue
//             );
//         }
//     }
    
//     @GetMapping("/chart-data")
//     public Map<String, Object> getChartData(Authentication authentication) {
//         boolean isAdmin = authentication.getAuthorities().stream()
//             .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

//         if (!isAdmin) {
//             return Map.of("error", "Access denied");
//         }

//         // Get current year
//         int currentYear = LocalDate.now().getYear();
        
//         // Get dynamic data for the current year
//         List<Map<String, Object>> usersData = getUserDataByMonth(currentYear);
//         List<Map<String, Object>> partnersData = getPartnerDataByMonth(currentYear);
//         List<Map<String, Object>> venuesData = getVenueDataByMonth(currentYear);
//         List<Map<String, Object>> bookingsData = getBookingDataByMonth(currentYear);
//         List<Map<String, Object>> ordersData = getOrderDataByMonth(currentYear);

//         Map<String, Object> response = new HashMap<>();
//         response.put("users", usersData);
//         response.put("partners", partnersData);
//         response.put("venues", venuesData);
//         response.put("bookings", bookingsData);
//         response.put("orders", ordersData);

//         return response;
//     }
    
//     private List<Map<String, Object>> getUserDataByMonth(int year) {
//         List<Map<String, Object>> result = new ArrayList<>();
        
//         // Get data from repository
//         List<Object[]> userMonthlyData = userRepo.countUsersPerMonth();
//         Map<Integer, Long> userCountMap = new HashMap<>();
        
//         for (Object[] data : userMonthlyData) {
//             Integer month = (Integer) data[0];
//             Long count = (Long) data[1];
//             userCountMap.put(month, count);
//         }
        
//         // Fill data for all 12 months
//         for (int month = 1; month <= 12; month++) {
//             Map<String, Object> monthData = new HashMap<>();
//             monthData.put("month", MONTHS[month - 1]);
            
//             Long count = userCountMap.getOrDefault(month, 0L);
//             monthData.put("users", count);
            
//             // Calculate growth (you might want to compare with previous month/year)
//             monthData.put("growth", calculateGrowth(month, userCountMap));
            
//             result.add(monthData);
//         }
        
//         return result;
//     }
    
//     private List<Map<String, Object>> getPartnerDataByMonth(int year) {
//         List<Map<String, Object>> result = new ArrayList<>();
        
//         // Get data from repository (you'll need to add this method to PartnerRepo)
//         List<Object[]> partnerMonthlyData = partnerRepo.countPartnersPerMonth();
//         Map<Integer, Long> partnerCountMap = new HashMap<>();
        
//         for (Object[] data : partnerMonthlyData) {
//             Integer month = (Integer) data[0];
//             Long count = (Long) data[1];
//             partnerCountMap.put(month, count);
//         }
        
//         // Fill data for all 12 months
//         for (int month = 1; month <= 12; month++) {
//             Map<String, Object> monthData = new HashMap<>();
//             monthData.put("month", MONTHS[month - 1]);
            
//             Long count = partnerCountMap.getOrDefault(month, 0L);
//             monthData.put("partners", count);
            
//             monthData.put("growth", calculateGrowth(month, partnerCountMap));
            
//             result.add(monthData);
//         }
        
//         return result;
//     }
    
//     private List<Map<String, Object>> getVenueDataByMonth(int year) {
//         List<Map<String, Object>> result = new ArrayList<>();
        
//         // Get data from repository (you'll need to add this method to VenueRepo)
//         List<Object[]> venueMonthlyData = venueRepo.countVenuesPerMonth();
//         Map<Integer, Long> venueCountMap = new HashMap<>();
        
//         for (Object[] data : venueMonthlyData) {
//             Integer month = (Integer) data[0];
//             Long count = (Long) data[1];
//             venueCountMap.put(month, count);
//         }
        
//         // Fill data for all 12 months
//         for (int month = 1; month <= 12; month++) {
//             Map<String, Object> monthData = new HashMap<>();
//             monthData.put("month", MONTHS[month - 1]);
            
//             Long count = venueCountMap.getOrDefault(month, 0L);
//             monthData.put("venues", count);
            
//             monthData.put("growth", calculateGrowth(month, venueCountMap));
            
//             result.add(monthData);
//         }
        
//         return result;
//     }
    
//     private List<Map<String, Object>> getBookingDataByMonth(int year) {
//         List<Map<String, Object>> result = new ArrayList<>();
        
//         // Get count data from repository
//         List<Object[]> bookingCountData = bookingRepo.countBookingsPerMonth();
//         Map<Integer, Long> bookingCountMap = new HashMap<>();
        
//         for (Object[] data : bookingCountData) {
//             Integer month = (Integer) data[0];
//             Long count = (Long) data[1];
//             bookingCountMap.put(month, count);
//         }
        
//         // Get revenue data from repository
//         List<Object[]> bookingRevenueData = bookingRepo.sumBookingRevenuePerMonth();
//         Map<Integer, Double> bookingRevenueMap = new HashMap<>();
        
//         for (Object[] data : bookingRevenueData) {
//             Integer month = (Integer) data[0];
//             Double revenue = (Double) data[1];
//             bookingRevenueMap.put(month, revenue != null ? revenue : 0.0);
//         }
        
//         // Fill data for all 12 months
//         for (int month = 1; month <= 12; month++) {
//             Map<String, Object> monthData = new HashMap<>();
//             monthData.put("month", MONTHS[month - 1]);
            
//             Long count = bookingCountMap.getOrDefault(month, 0L);
//             monthData.put("bookings", count);
            
//             Double revenue = bookingRevenueMap.getOrDefault(month, 0.0);
//             monthData.put("revenue", revenue);
            
//             result.add(monthData);
//         }
        
//         return result;
//     }
    
//     private List<Map<String, Object>> getOrderDataByMonth(int year) {
//         List<Map<String, Object>> result = new ArrayList<>();
        
//         // Get count data from repository
//         List<Object[]> orderCountData = orderRepo.countOrdersPerMonth();
//         Map<Integer, Long> orderCountMap = new HashMap<>();
        
//         for (Object[] data : orderCountData) {
//             Integer month = (Integer) data[0];
//             Long count = (Long) data[1];
//             orderCountMap.put(month, count);
//         }
        
//         // Get revenue data from repository
//         List<Object[]> orderRevenueData = orderRepo.sumOrderRevenuePerMonth();
//         Map<Integer, BigDecimal> orderRevenueMap = new HashMap<>();
        
//         for (Object[] data : orderRevenueData) {
//             Integer month = (Integer) data[0];
//             BigDecimal revenue = (BigDecimal) data[1];
//             orderRevenueMap.put(month, revenue != null ? revenue : BigDecimal.ZERO);
//         }
        
//         // Fill data for all 12 months
//         for (int month = 1; month <= 12; month++) {
//             Map<String, Object> monthData = new HashMap<>();
//             monthData.put("month", MONTHS[month - 1]);
            
//             Long count = orderCountMap.getOrDefault(month, 0L);
//             monthData.put("orders", count);
            
//             BigDecimal revenue = orderRevenueMap.getOrDefault(month, BigDecimal.ZERO);
//             monthData.put("revenue", revenue);
            
//             result.add(monthData);
//         }
        
//         return result;
//     }
    
//     private int calculateGrowth(int currentMonth, Map<Integer, Long> countMap) {
//         int previousMonth = currentMonth - 1;
//         if (previousMonth < 1) return 0; // No previous month for January
        
//         Long currentCount = countMap.getOrDefault(currentMonth, 0L);
//         Long previousCount = countMap.getOrDefault(previousMonth, 0L);
        
//         if (previousCount == 0) return 0;
        
//         double growth = ((double) (currentCount - previousCount) / previousCount) * 100;
//         return (int) Math.round(growth);
//     }
// }