package com.skillexchange.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * OnlineSession Entity representing a scheduled online skill exchange meeting
 * conducted between an accepted teacher and learner via Zoom.
 */
@Entity
@Table(name = "online_sessions")
public class OnlineSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
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

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "scheduled_date", nullable = false, length = 30)
    private String scheduledDate;

    @Column(name = "scheduled_time", nullable = false, length = 30)
    private String scheduledTime;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 60;

    @Column(name = "zoom_meeting_id", length = 100)
    private String zoomMeetingId;

    @Column(name = "zoom_join_url", columnDefinition = "TEXT")
    private String zoomJoinUrl;

    @Column(name = "zoom_password", length = 100)
    private String zoomPassword;

    @Column(nullable = false, length = 30)
    private String status = "Scheduled"; // Scheduled, Live, Completed

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public OnlineSession() {
    }

    public OnlineSession(ExchangeRequest exchangeRequest, User teacher, User learner, String skillName,
                         String title, String description, String scheduledDate, String scheduledTime,
                         Integer durationMinutes, String zoomMeetingId, String zoomJoinUrl, String zoomPassword) {
        this.exchangeRequest = exchangeRequest;
        this.teacher = teacher;
        this.learner = learner;
        this.skillName = skillName;
        this.title = title;
        this.description = description;
        this.scheduledDate = scheduledDate;
        this.scheduledTime = scheduledTime;
        this.durationMinutes = durationMinutes != null ? durationMinutes : 60;
        this.zoomMeetingId = zoomMeetingId;
        this.zoomJoinUrl = zoomJoinUrl;
        this.zoomPassword = zoomPassword;
        this.status = "Scheduled";
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

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(String scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(String scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getZoomMeetingId() {
        return zoomMeetingId;
    }

    public void setZoomMeetingId(String zoomMeetingId) {
        this.zoomMeetingId = zoomMeetingId;
    }

    public String getZoomJoinUrl() {
        return zoomJoinUrl;
    }

    public void setZoomJoinUrl(String zoomJoinUrl) {
        this.zoomJoinUrl = zoomJoinUrl;
    }

    public String getZoomPassword() {
        return zoomPassword;
    }

    public void setZoomPassword(String zoomPassword) {
        this.zoomPassword = zoomPassword;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
