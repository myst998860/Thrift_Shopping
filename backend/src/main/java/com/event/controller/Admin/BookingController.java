package com.event.controller.Admin;

import org.springframework.web.bind.annotation.*;

import com.event.dto.BookingDTO;
import com.event.model.Attendee;
import com.event.model.Booking;
import com.event.model.Partner;
import com.event.model.Venue;
import com.event.repository.AttendeeRepo;
import com.event.repository.BookingRepo;
import com.event.repository.VenueRepo;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RequestMapping("/bookings")
@RestController
public class BookingController {
	
	
	@Autowired
	private BookingRepo bookingRepo;
	    

	@Autowired
	private VenueRepo venueRepo;
	
	 @Autowired
	    private AttendeeRepo attendeeRepo;
	
	public BookingController(BookingRepo bookingRepo) {
        this.bookingRepo = bookingRepo;
    }
	 
	@GetMapping
    public List<BookingDTO> listBookings() {
        return bookingRepo.findAll().stream()
                .map(BookingDTO::fromBooking)
                .collect(Collectors.toList());
    }

	@PostMapping("/new")
	public ResponseEntity<BookingDTO> saveBooking(@RequestBody BookingDTO dto) {
	    Venue venue = venueRepo.findById(dto.getVenueId())
	            .orElseThrow(() -> new EntityNotFoundException("Venue not found"));
	    Attendee attendee = attendeeRepo.findById(dto.getAttendeeId())
	            .orElseThrow(() -> new EntityNotFoundException("Attendee not found"));

	    Booking booking = new Booking();
	    booking.setVenue(venue);
	    booking.setAttendee(attendee);
	    booking.setStatus(dto.getStatus());
	    booking.setBookedTime(dto.getBookedTime());
	    booking.setDuration(dto.getDuration());
	    booking.setGuests(dto.getGuests());
	    booking.setSpecialRequests(dto.getSpecialRequests());

	    BigDecimal price = venue.getPrice();
	    int duration = dto.getDuration();
	    BigDecimal amount = price != null ? price.multiply(BigDecimal.valueOf(duration)) : BigDecimal.ZERO;
	    booking.setAmount(amount);

	    Booking savedBooking = bookingRepo.save(booking);

	    // Convert to DTO before returning:
	    BookingDTO responseDto = BookingDTO.fromBooking(savedBooking);

	    return ResponseEntity.ok(responseDto);
	}
	
	
    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable("id") Long id) {
        Optional<Booking> optionalBooking = bookingRepo.findById(id);

        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = optionalBooking.get();
        BookingDTO dto = BookingDTO.fromBooking(booking);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<BookingDTO> updateBooking(@PathVariable("id") Long id, @RequestBody BookingDTO bookingDTO) {
        Optional<Booking> optionalBooking = bookingRepo.findById(id);
        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = optionalBooking.get();

        // Update editable fields
        booking.setStatus(bookingDTO.getStatus());
        booking.setBookedTime(bookingDTO.getBookedTime());
        booking.setDuration(bookingDTO.getDuration());
        booking.setGuests(bookingDTO.getGuests());
        booking.setSpecialRequests(bookingDTO.getSpecialRequests());

        bookingRepo.save(booking);

        BookingDTO updatedDTO = BookingDTO.fromBooking(booking);
        return ResponseEntity.ok(updatedDTO);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByUserId(@PathVariable Long userId) {
        List<Booking> bookings = bookingRepo.findBookingsByUserId(userId);  // fixed method name & param

        if (bookings.isEmpty()) {
            return ResponseEntity.noContent().build();  // 204 No Content if no bookings
        }

        List<BookingDTO> dtos = bookings.stream()
            .map(BookingDTO::fromBooking)
            .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
    
    
    @DeleteMapping("/delete/{bookingId}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long bookingId) {
      if (bookingRepo.existsById(bookingId)) {
        bookingRepo.deleteById(bookingId);
        return ResponseEntity.noContent().build();
      } else {
        return ResponseEntity.notFound().build();
      }
    }
    
}

    