package com.event.repository;

<<<<<<< Updated upstream
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.event.model.Donation;
=======
import com.event.model.Donation;
import com.event.model.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
>>>>>>> Stashed changes

@Repository
public interface DonationRepo extends JpaRepository<Donation, Long> {

<<<<<<< Updated upstream
    // 🔹 Filter by city
    List<Donation> findByCityIgnoreCase(String city);

    // 🔹 Filter by overall condition (New, Good, Fair)
    List<Donation> findByOverallConditionIgnoreCase(String overallCondition);

    // 🔹 Filter by both city and condition
=======
    // Find donations by program
    List<Donation> findByProgram(Program program);

    // Optional filters
    List<Donation> findByCityIgnoreCase(String city);

    List<Donation> findByOverallConditionIgnoreCase(String overallCondition);

>>>>>>> Stashed changes
    List<Donation> findByCityIgnoreCaseAndOverallConditionIgnoreCase(String city, String overallCondition);
}
