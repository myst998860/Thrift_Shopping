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

	

}

