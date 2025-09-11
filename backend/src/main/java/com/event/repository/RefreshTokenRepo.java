package com.event.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.event.model.RefreshToken;

import jakarta.transaction.Transactional;

@Repository
public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Query("SELECT r FROM RefreshToken r WHERE r.jti = :jti AND r.user.user_id = :userId AND r.sessionId = :sessionId")
    Optional<RefreshToken> findByJtiAndUserUser_idAndSessionId(
        @Param("jti") String jti, 
        @Param("userId") Long userId, 
        @Param("sessionId") String sessionId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken r WHERE r.user.user_id = :userId")
    void deleteByUserUser_id(@Param("userId") Long userId);
}