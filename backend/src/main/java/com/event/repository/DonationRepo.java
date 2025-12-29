package com.event.repository;

import com.event.model.Donation;
import com.event.model.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepo extends JpaRepository<Donation, Long> {

    // Find donations by program
    List<Donation> findByProgram(Program program);

    // Optional filters
    List<Donation> findByCityIgnoreCase(String city);

    List<Donation> findByOverallConditionIgnoreCase(String overallCondition);

    List<Donation> findByCityIgnoreCaseAndOverallConditionIgnoreCase(String city, String overallCondition);
}
