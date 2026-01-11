package com.event.repository;

import com.event.model.Donation;
import com.event.model.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT COUNT(d) FROM Donation d WHERE d.program.partner.user_id = :userId AND LOWER(d.status) = LOWER(:status)")
    long countByPartnerAndStatus(@Param("userId") Long userId, @Param("status") String status);

    long countByStatusIgnoreCase(String status);
}
