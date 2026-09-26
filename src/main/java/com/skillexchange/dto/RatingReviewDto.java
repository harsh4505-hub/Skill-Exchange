package com.skillexchange.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class RatingReviewDto {
    private Long id;

    @NotNull(message = "Exchange ID is required")
    private Long exchangeId;

    private Long reviewerId;
    private String reviewerName;

    @NotNull(message = "Reviewed student ID is required")
    private Long reviewedStudentId;
    private String reviewedStudentName;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1 star")
    @Max(value = 5, message = "Rating cannot exceed 5 stars")
    private Integer rating;

    private String comment;
    private LocalDateTime createdAt;

    public RatingReviewDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getExchangeId() {
        return exchangeId;
    }

    public void setExchangeId(Long exchangeId) {
        this.exchangeId = exchangeId;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public Long getReviewedStudentId() {
        return reviewedStudentId;
    }

    public void setReviewedStudentId(Long reviewedStudentId) {
        this.reviewedStudentId = reviewedStudentId;
    }

    public String getReviewedStudentName() {
        return reviewedStudentName;
    }

    public void setReviewedStudentName(String reviewedStudentName) {
        this.reviewedStudentName = reviewedStudentName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
