package com.skillexchange.controller;

import com.skillexchange.dto.ApiResponse;
import com.skillexchange.dto.RatingReviewDto;
import com.skillexchange.service.AuthService;
import com.skillexchange.service.RatingReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for ratings, reviews, and student feedback.
 */
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private RatingReviewService reviewService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<ApiResponse<RatingReviewDto>> submitReview(@Valid @RequestBody RatingReviewDto dto) {
        Long currentUserId = authService.getCurrentUserId();
        RatingReviewDto review = reviewService.submitReview(currentUserId, dto);
        return ResponseEntity.ok(ApiResponse.ok("Review submitted successfully!", review));
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<ApiResponse<List<RatingReviewDto>>> getStudentReviews(@PathVariable Long studentId) {
        List<RatingReviewDto> reviews = reviewService.getReviewsForStudent(studentId);
        return ResponseEntity.ok(ApiResponse.ok("Reviews retrieved", reviews));
    }
}
