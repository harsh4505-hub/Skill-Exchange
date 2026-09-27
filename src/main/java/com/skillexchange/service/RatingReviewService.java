package com.skillexchange.service;

import com.skillexchange.dto.RatingReviewDto;
import com.skillexchange.entity.*;
import com.skillexchange.exception.BadRequestException;
import com.skillexchange.exception.DuplicateResourceException;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * RatingReviewService handles peer rating submissions, reviews,
 * duplicate prevention, and average rating updates.
 */
@Service
public class RatingReviewService {

    @Autowired
    private RatingReviewRepository reviewRepository;

    @Autowired
    private ExchangeRepository exchangeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public RatingReviewDto submitReview(Long reviewerId, RatingReviewDto dto) {
        if (reviewerId.equals(dto.getReviewedStudentId())) {
            throw new BadRequestException("You cannot rate or review yourself");
        }

        Exchange exchange = exchangeRepository.findById(dto.getExchangeId())
                .orElseThrow(() -> new ResourceNotFoundException("Exchange not found: " + dto.getExchangeId()));

        if (!"COMPLETED".equalsIgnoreCase(exchange.getStatus())) {
            throw new BadRequestException("Reviews can only be submitted after an exchange is marked COMPLETED");
        }

        // Verify reviewer was part of exchange
        boolean isPart = exchange.getStudent1().getId().equals(reviewerId) ||
                         exchange.getStudent2().getId().equals(reviewerId);
        if (!isPart) {
            throw new BadRequestException("You were not a participant in this exchange");
        }

        // Prevent multiple reviews by same student for the same exchange
        if (reviewRepository.existsByExchangeIdAndReviewerId(dto.getExchangeId(), reviewerId)) {
            throw new DuplicateResourceException("You have already reviewed this exchange");
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found: " + reviewerId));
        User reviewedStudent = userRepository.findById(dto.getReviewedStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewed student not found: " + dto.getReviewedStudentId()));

        RatingReview review = new RatingReview();
        review.setExchange(exchange);
        review.setReviewer(reviewer);
        review.setReviewedStudent(reviewedStudent);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setCreatedAt(LocalDateTime.now());

        RatingReview saved = reviewRepository.save(review);

        // Recalculate average rating for the reviewed student
        Double avgRating = reviewRepository.calculateAverageRatingForStudent(reviewedStudent.getId());
        if (avgRating != null) {
            StudentProfile profile = profileRepository.findByUserId(reviewedStudent.getId()).orElse(null);
            if (profile != null) {
                profile.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
                profileRepository.save(profile);
            }
        }

        // Send notification
        String reviewerName = reviewer.getStudentProfile() != null ?
                reviewer.getStudentProfile().getFullName() : reviewer.getEmail();
        notificationService.createNotification(
                reviewedStudent,
                "New Peer Evaluation Received (" + dto.getRating() + "/5)",
                reviewerName + " submitted an evaluation score of " + dto.getRating() + "/5: \"" +
                        (dto.getComment() != null ? dto.getComment() : "Great skill exchange!") + "\"",
                "NEW_REVIEW",
                saved.getId()
        );

        return mapToDto(saved);
    }

    public List<RatingReviewDto> getReviewsForStudent(Long studentId) {
        return reviewRepository.findByReviewedStudentIdOrderByCreatedAtDesc(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private RatingReviewDto mapToDto(RatingReview r) {
        RatingReviewDto dto = new RatingReviewDto();
        dto.setId(r.getId());
        dto.setExchangeId(r.getExchange().getId());
        dto.setReviewerId(r.getReviewer().getId());
        dto.setReviewerName(r.getReviewer().getStudentProfile() != null ? r.getReviewer().getStudentProfile().getFullName() : r.getReviewer().getEmail());
        dto.setReviewedStudentId(r.getReviewedStudent().getId());
        dto.setReviewedStudentName(r.getReviewedStudent().getStudentProfile() != null ? r.getReviewedStudent().getStudentProfile().getFullName() : r.getReviewedStudent().getEmail());
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
