package com.skillexchange.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * RatingReview Entity for post-exchange student peer reviews and star ratings.
 */
@Entity
@Table(name = "ratings_reviews",
       uniqueConstraints = @UniqueConstraint(columnNames = {"exchange_id", "reviewer_id"}))
public class RatingReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exchange_id", nullable = false)
    private Exchange exchange;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewed_student_id", nullable = false)
    private User reviewedStudent;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public RatingReview() {
    }

    public RatingReview(Exchange exchange, User reviewer, User reviewedStudent, Integer rating, String comment) {
        this.exchange = exchange;
        this.reviewer = reviewer;
        this.reviewedStudent = reviewedStudent;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Exchange getExchange() {
        return exchange;
    }

    public void setExchange(Exchange exchange) {
        this.exchange = exchange;
    }

    public User getReviewer() {
        return reviewer;
    }

    public void setReviewer(User reviewer) {
        this.reviewer = reviewer;
    }

    public User getReviewedStudent() {
        return reviewedStudent;
    }

    public void setReviewedStudent(User reviewedStudent) {
        this.reviewedStudent = reviewedStudent;
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
