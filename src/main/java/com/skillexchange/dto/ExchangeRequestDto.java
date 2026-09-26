package com.skillexchange.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ExchangeRequestDto {
    private Long id;

    private Long senderId;
    private String senderName;
    private String senderEmail;

    @NotNull(message = "Receiver is required")
    private Long receiverId;
    private String receiverName;

    @NotNull(message = "Skill offered is required")
    private Long skillOfferedId;
    private String skillOfferedName;

    @NotNull(message = "Skill requested is required")
    private Long skillRequestedId;
    private String skillRequestedName;

    private String message;

    @NotBlank(message = "Learning mode is required")
    private String learningMode; // ONLINE, OFFLINE, CHAT

    private String status; // PENDING, ACCEPTED, REJECTED, COMPLETED
    private LocalDateTime createdAt;

    public ExchangeRequestDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public Long getSkillOfferedId() {
        return skillOfferedId;
    }

    public void setSkillOfferedId(Long skillOfferedId) {
        this.skillOfferedId = skillOfferedId;
    }

    public String getSkillOfferedName() {
        return skillOfferedName;
    }

    public void setSkillOfferedName(String skillOfferedName) {
        this.skillOfferedName = skillOfferedName;
    }

    public Long getSkillRequestedId() {
        return skillRequestedId;
    }

    public void setSkillRequestedId(Long skillRequestedId) {
        this.skillRequestedId = skillRequestedId;
    }

    public String getSkillRequestedName() {
        return skillRequestedName;
    }

    public void setSkillRequestedName(String skillRequestedName) {
        this.skillRequestedName = skillRequestedName;
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
}
