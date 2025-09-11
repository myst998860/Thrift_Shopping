package com.event.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.event.model.Partner;
import com.event.model.User;


@Repository
public interface PartnerRepo extends JpaRepository<Partner, Long> {

	  Optional<Partner> findByEmail(String email);	
	
	Optional<Partner> findById(Long id);
	
	 @Query("SELECT u FROM User u JOIN u.venues v WHERE v.id = :venueId AND u.role = 'PARTNER'")
	    User findPartnerByVenueId(@Param("venueId") Long venueId);

	 @Query("SELECT p FROM Partner p JOIN p.venues v WHERE p.role = :role AND v.id = :venueId")
	    List<Partner> findByRoleAndVenueId(@Param("role") String role, @Param("venueId") Long venueId);
}

