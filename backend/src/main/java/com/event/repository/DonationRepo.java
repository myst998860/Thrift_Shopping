package com.event.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.event.model.Donation;

@Repository
public interface DonationRepo extends JpaRepository<Donation, Long> {

    // 🔹 Filter by city
    List<Donation> findByCityIgnoreCase(String city);

    // 🔹 Filter by overall condition (New, Good, Fair)
    List<Donation> findByOverallConditionIgnoreCase(String overallCondition);

    // 🔹 Filter by both city and condition
    List<Donation> findByCityIgnoreCaseAndOverallConditionIgnoreCase(String city, String overallCondition);
}
