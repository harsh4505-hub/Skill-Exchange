package com.skillexchange.repository;

import com.skillexchange.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);
    List<StudentProfile> findByIsBlockedFalse();

    @Query("SELECT p FROM StudentProfile p WHERE p.isBlocked = false AND " +
           "(LOWER(p.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(p.college) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(p.department) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<StudentProfile> searchProfiles(@Param("query") String query);
}
