package com.event.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.event.model.Contact;

import java.util.List;

@Repository
public interface ContactRepo extends JpaRepository<Contact, Long> {
	
	

    // Find contacts by full name (case-insensitive)
    List<Contact> findByFullNameIgnoreCase(String fullName);

    // Find contacts by email address (case-insensitive)
    List<Contact> findByEmailAddressIgnoreCase(String emailAddress);

    // Find contacts by message containing some keyword (case-insensitive)
    List<Contact> findByMessageContainingIgnoreCase(String keyword);

    // Optionally: Find contacts by full name and email
    List<Contact> findByFullNameIgnoreCaseAndEmailAddressIgnoreCase(String fullName, String emailAddress);
}
