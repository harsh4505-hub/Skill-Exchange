package com.skillexchange.repository;

import com.skillexchange.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for EmailVerification entity.
 */
@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    Optional<EmailVerification> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);

    Optional<EmailVerification> findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(Long userId);

    List<EmailVerification> findByEmailAndUsedFalse(String email);

    void deleteByEmail(String email);
}
