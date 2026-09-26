package com.skillexchange.repository;

import com.skillexchange.entity.SkillVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillVerificationRepository extends JpaRepository<SkillVerification, Long> {
    List<SkillVerification> findByStudentIdOrderBySubmissionDateDesc(Long studentId);
    List<SkillVerification> findByStatusOrderBySubmissionDateDesc(String status);
    long countByStatus(String status);
    boolean existsByStudentIdAndSkillIdAndStatus(Long studentId, Long skillId, String status);
}
