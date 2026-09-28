package com.skillexchange.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * OfflineProgressUpdate represents an individual session log or milestone update
 * submitted by a student participating in an offline exchange.
 */
@Entity
@Table(name = "offline_progress_updates")
public class OfflineProgressUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "offline_exchange_progress_id", nullable = false)
    private OfflineExchangeProgress offlineExchangeProgress;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "submitted_by_id", nullable = false)
    private User submittedBy;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate = LocalDate.now();

    @Column(name = "stage", length = 100)
    private String stage;

    @Column(name = "topics_covered", nullable = false, columnDefinition = "TEXT")
    private String topicsCovered;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage;

    @Column(name = "next_activity", length = 255)
    private String nextActivity;

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public OfflineProgressUpdate() {
    }

    public OfflineProgressUpdate(OfflineExchangeProgress progress, User submittedBy, LocalDate sessionDate,
                                 String stage, String topicsCovered, String description,
                                 Integer progressPercentage, String nextActivity, String attachmentUrl) {
        this.offlineExchangeProgress = progress;
        this.submittedBy = submittedBy;
        this.sessionDate = sessionDate != null ? sessionDate : LocalDate.now();
        this.stage = stage;
        this.topicsCovered = topicsCovered;
        this.description = description;
        this.progressPercentage = progressPercentage;
        this.nextActivity = nextActivity;
        this.attachmentUrl = attachmentUrl;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OfflineExchangeProgress getOfflineExchangeProgress() {
        return offlineExchangeProgress;
    }

    public void setOfflineExchangeProgress(OfflineExchangeProgress offlineExchangeProgress) {
        this.offlineExchangeProgress = offlineExchangeProgress;
    }

    public User getSubmittedBy() {
        return submittedBy;
    }

    public void setSubmittedBy(User submittedBy) {
        this.submittedBy = submittedBy;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getTopicsCovered() {
        return topicsCovered;
    }

    public void setTopicsCovered(String topicsCovered) {
        this.topicsCovered = topicsCovered;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getNextActivity() {
        return nextActivity;
    }

    public void setNextActivity(String nextActivity) {
        this.nextActivity = nextActivity;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
