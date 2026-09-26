package com.skillexchange.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * ExchangeRequest Entity representing a proposal from one student to another
 * to exchange their respective skills.
 */
@Entity
@Table(name = "exchange_requests")
public class ExchangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_offered_id", nullable = false)
    private Skill skillOffered;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_requested_id", nullable = false)
    private Skill skillRequested;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "learning_mode", nullable = false, length = 30)
    private String learningMode = "ONLINE"; // ONLINE, OFFLINE, CHAT

    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED, COMPLETED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ExchangeRequest() {
    }

    public ExchangeRequest(User sender, User receiver, Skill skillOffered, Skill skillRequested, String message, String learningMode) {
        this.sender = sender;
        this.receiver = receiver;
        this.skillOffered = skillOffered;
        this.skillRequested = skillRequested;
        this.message = message;
        this.learningMode = learningMode;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public User getReceiver() {
        return receiver;
    }

    public void setReceiver(User receiver) {
        this.receiver = receiver;
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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getLearningMode() {
        return learningMode;
    }

    public void setLearningMode(String learningMode) {
        this.learningMode = learningMode;
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
