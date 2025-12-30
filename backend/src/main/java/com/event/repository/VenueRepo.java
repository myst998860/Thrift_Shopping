package com.event.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.event.model.Partner;
import com.event.model.Venue;



@Repository
public interface VenueRepo extends JpaRepository<Venue, Long> {
	
	Venue findByVenueName(String venueName);
	
	List<Venue> findByPartner(Partner partner);
	
	Optional<Venue> findById(Long id);
	
	long countByPartner(Partner partner);
	
//	 List<Venue> findByPartnerId(Long partnerId); 
	
	List<Venue> findByCategoryIgnoreCase(String category);
	
//	List<Venue> findByLocationIgnoreCase(String location);
	
//	List<Venue> findByCategoryIgnoreCaseAndLocationIgnoreCase(String category);
	@Query("SELECT FUNCTION('MONTH', v.joinDate) as month, COUNT(v) FROM Venue v GROUP BY FUNCTION('MONTH', v.joinDate)")
	List<Object[]> countVenuesPerMonth();
	
	// VenueRepo
	long count();
	
	@Query("""
		    SELECT FUNCTION('MONTH', v.createdAt), COUNT(v)
		    FROM Venue v
		    WHERE FUNCTION('YEAR', v.createdAt) = :year
		    GROUP BY FUNCTION('MONTH', v.createdAt)
		    ORDER BY FUNCTION('MONTH', v.createdAt)
		""")
		List<Object[]> countVenuesPerMonth(@Param("year") int year);
	

	
}
