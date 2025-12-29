package com.event.repository;

import com.event.model.Partner;
import com.event.model.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramRepo extends JpaRepository<Program, Long> {

    // Optional filter methods
    List<Program> findByCategoryIgnoreCase(String category);

    List<Program> findByProgramLocationIgnoreCase(String programLocation);

    List<Program> findByCategoryIgnoreCaseAndProgramLocationIgnoreCase(String category, String programLocation);
    
    @Query("SELECT COUNT(p) FROM Program p WHERE p.partner.user_id = :partnerId")
    long countByPartnerId(@Param("partnerId") Long partnerId);

    @Query("SELECT COUNT(p) FROM Program p WHERE p.partner.user_id = :partnerId AND p.status IN :statuses")
    long countByPartnerIdAndStatusIn(@Param("partnerId") Long partnerId, @Param("statuses") List<String> statuses);


    // Count programs by Partner entity directly
    int countByPartner(Partner partner);
    
    
    
//    @Query("SELECT COUNT(p) FROM Program p WHERE p.partner.id = :partnerId")
//    int countByPartnerId(@Param("partnerId") Long partnerId);
//    
//    @Query("SELECT COUNT(p) FROM Program p WHERE p.partner.id = :partnerId AND p.status IN :statuses")
//    int countByPartnerIdAndStatusIn(@Param("partnerId") Long partnerId, @Param("statuses") List<String> statuses);

}