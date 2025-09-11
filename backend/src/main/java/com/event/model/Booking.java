package com.event.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Booking {

	 	@Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long booking_Id;

	    private String status;
	    
	    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
	    private LocalDateTime bookedTime;

	    @ManyToOne
	    @JoinColumn(name = "venue_id", nullable = false)
	    private Venue venue;

	    

	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "customer_id")
	    private Attendee attendee;

	    private int duration;
	    private int guests;
	    private String specialRequests;
	    private BigDecimal amount;
	    



		public Long getBooking_Id() {
			return booking_Id;
		}

		public void setBooking_Id(Long booking_Id) {
			this.booking_Id = booking_Id;
		}

		public String getStatus() {
			return status;
		}

		public void setStatus(String status) {
			this.status = status;
		}

		

		public LocalDateTime getBookedTime() {
			return bookedTime;
		}

		public void setBookedTime(LocalDateTime bookedTime) {
			this.bookedTime = bookedTime;
		}

		public Venue getVenue() {
			return venue;
		}

		public void setVenue(Venue venue) {
			this.venue = venue;
		}

		public int getDuration() {
			return duration;
		}

		public void setDuration(int duration) {
			this.duration = duration;
		}

		public int getGuests() {
			return guests;
		}

		public void setGuests(int guests) {
			this.guests = guests;
		}

		public String getSpecialRequests() {
			return specialRequests;
		}

		public void setSpecialRequests(String specialRequests) {
			this.specialRequests = specialRequests;
		}

		public Attendee getAttendee() {
			return attendee;
		}

		public void setAttendee(Attendee attendee) {
			this.attendee = attendee;
		}

		public BigDecimal getAmount() {
			return amount;
		}

		public void setAmount(BigDecimal amount) {
			this.amount = amount;
		}
		
		
	    
	    

	  
}
