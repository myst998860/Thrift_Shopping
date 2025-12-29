//package com.event.controller;
//
//import java.util.List;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//
//import com.event.model.Booking;
//
//import com.event.repository.BookingRepo;
//
//@RestController
//@RequestMapping("/admin")
//@CrossOrigin
//public class AdminController {
//
//    private final CartRepo cartRepo;
//    private final BookingRepo bookingRepo;
//
//    public AdminController(CartRepo cartRepo, BookingRepo bookingRepo) {
//        this.cartRepo = cartRepo;
//        this.bookingRepo = bookingRepo;
//    }
//
//    @GetMapping("/carts")
//    public ResponseEntity<List<Cart>> getAllCarts() {
//        return ResponseEntity.ok(cartRepo.findAll());
//    }
//
//    @GetMapping("/bookings")
//    public ResponseEntity<List<Booking>> getAllBookings() {
//        return ResponseEntity.ok(bookingRepo.findAll());
//    }
//
//    @GetMapping("/carts/{id}")
//    public ResponseEntity<Cart> getCart(@PathVariable Long id) {
//        return ResponseEntity.ok(cartRepo.findById(id).orElseThrow(() -> new RuntimeException("Cart not found")));
//    }
//}
