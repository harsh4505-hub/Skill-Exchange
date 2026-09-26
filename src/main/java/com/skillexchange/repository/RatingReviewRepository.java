package com.skillexchange.repository;

import com.skillexchange.entity.RatingReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingReviewRepository extends JpaRepository<RatingReview, Long> {
    List<RatingReview> findByReviewedStudentIdOrderByCreatedAtDesc(Long reviewedStudentId);
    boolean existsByExchangeIdAndReviewerId(Long exchangeId, Long reviewerId);

    @Query("SELECT AVG(r.rating) FROM RatingReview r WHERE r.reviewedStudent.id = :studentId")
    Double calculateAverageRatingForStudent(@Param("studentId") Long studentId);
}
