package com.event.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.event.model.Partner;
import com.event.model.Venue;



@Repository
public interface VenueRepo extends JpaRepository<Venue, Long> {
	
	Venue findByVenueName(String venueName);
	
	List<Venue> findByPartner(Partner partner);
	
	Optional<Venue> findById(Long id);
	
	long countByPartner(Partner partner);
	
	
	List<Venue> findByCategoryIgnoreCase(String category);
	
	List<Venue> findByLocationIgnoreCase(String location);
	
	List<Venue> findByCategoryIgnoreCaseAndLocationIgnoreCase(String category, String location);
	
	
	
	

	
}
