package com.event.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.event.model.User;


@Repository
public interface UserRepo extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);
	
	Optional<User> findById(Long id);
	
	  long countByUserTypeIn(List<String> userTypes);
	  
	
	    List<User> findByRole(String role);
	    
	    @Query("SELECT FUNCTION('MONTH', u.joinDate) as month, COUNT(u) FROM User u GROUP BY FUNCTION('MONTH', u.joinDate)")
	    List<Object[]> countUsersPerMonth();
	    
	 // UserRepo
	    long count();



	    @Query("""
	        SELECT 
	            FUNCTION('MONTH', u.createdAt) AS month,
	            COUNT(u)
	        FROM User u
	        WHERE FUNCTION('YEAR', u.createdAt) = :year
	        GROUP BY FUNCTION('MONTH', u.createdAt)
	        ORDER BY FUNCTION('MONTH', u.createdAt)
	    """)
	    List<Object[]> countUsersPerMonth(@Param("year") int year);

}

