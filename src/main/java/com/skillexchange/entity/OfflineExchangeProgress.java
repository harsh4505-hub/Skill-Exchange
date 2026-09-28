package com.skillexchange.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * OfflineExchangeProgress tracks progress, stages, and session milestones
 * specifically for skill exchanges conducted in OFFLINE mode.
 */
@Entity
@Table(name = "offline_exchange_progress")
public class OfflineExchangeProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exchange_request_id", nullable = false)
    private ExchangeRequest exchangeRequest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exchange_id")
    private Exchange exchange;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "learner_id", nullable = false)
    private User learner;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_offered_id", nullable = false)
    private Skill skillOffered;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_requested_id", nullable = false)
    private Skill skillRequested;

    @Column(name = "location", length = 255)
    private String location = "Campus Library / Tech Lab";

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate = LocalDateTime.now();

    @Column(name = "expected_completion_date")
    private LocalDateTime expectedCompletionDate;

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage = 0;

    @Column(name = "current_stage", nullable = false, length = 100)
    private String currentStage = "Exchange Accepted";

    @Column(name = "status", nullable = false, length = 50)
    private String status = "ACTIVE"; // ACTIVE, NEEDS_ATTENTION, COMPLETED

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt = LocalDateTime.now();

    @Column(name = "next_activity", length = 255)
    private String nextActivity = "Offline Session Planned";

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public OfflineExchangeProgress() {
    }

    public OfflineExchangeProgress(ExchangeRequest exchangeRequest, Exchange exchange, User teacher, User learner,
                                   Skill skillOffered, Skill skillRequested, String location) {
        this.exchangeRequest = exchangeRequest;
        this.exchange = exchange;
        this.teacher = teacher;
        this.learner = learner;
        this.skillOffered = skillOffered;
        this.skillRequested = skillRequested;
        this.location = (location != null && !location.trim().isEmpty()) ? location : "Campus Library / Tech Lab";
        this.startDate = LocalDateTime.now();
        this.expectedCompletionDate = LocalDateTime.now().plusDays(21);
        this.progressPercentage = 10;
        this.currentStage = "Exchange Accepted";
        this.status = "ACTIVE";
        this.lastActivityAt = LocalDateTime.now();
        this.nextActivity = "Offline Session Planned";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ExchangeRequest getExchangeRequest() {
        return exchangeRequest;
    }

    public void setExchangeRequest(ExchangeRequest exchangeRequest) {
        this.exchangeRequest = exchangeRequest;
    }

    public Exchange getExchange() {
        return exchange;
    }

    public void setExchange(Exchange exchange) {
        this.exchange = exchange;
    }

    public User getTeacher() {
        return teacher;
    }

    public void setTeacher(User teacher) {
        this.teacher = teacher;
    }

    public User getLearner() {
        return learner;
    }

    public void setLearner(User learner) {
        this.learner = learner;
    }

    public Skill getSkillOffered() {
        return skillOffered;
    }

    public void setSkillOffered(Skill skillOffered) {
        this.skillOffered = skillOffered;
    }

    public Skill getSkillRequested() {
        return skillRequested;
    }

    public void setSkillRequested(Skill skillRequested) {
        this.skillRequested = skillRequested;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getExpectedCompletionDate() {
        return expectedCompletionDate;
    }

    public void setExpectedCompletionDate(LocalDateTime expectedCompletionDate) {
        this.expectedCompletionDate = expectedCompletionDate;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getCurrentStage() {
        return currentStage;
    }

    public void setCurrentStage(String currentStage) {
        this.currentStage = currentStage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }

    public String getNextActivity() {
        return nextActivity;
    }

    public void setNextActivity(String nextActivity) {
        this.nextActivity = nextActivity;
    }

    public LocalDateTime getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDateTime completionDate) {
        this.completionDate = completionDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
