package com.skillexchange.dto;

import java.time.LocalDateTime;

public class ExchangeDto {
    private Long id;
    private Long requestId;

    private Long student1Id;
    private String student1Name;

    private Long student2Id;
    private String student2Name;

    private Long skill1Id;
    private String skill1Name;

    private Long skill2Id;
    private String skill2Name;

    private String learningMode;
    private String status; // ACTIVE, COMPLETED, CANCELLED
    private LocalDateTime startDate;
    private LocalDateTime completionDate;
    private boolean isReviewedByCurrentStudent;

    public ExchangeDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getStudent1Id() {
        return student1Id;
    }

    public void setStudent1Id(Long student1Id) {
        this.student1Id = student1Id;
    }

    public String getStudent1Name() {
        return student1Name;
    }

    public void setStudent1Name(String student1Name) {
        this.student1Name = student1Name;
    }

    public Long getStudent2Id() {
        return student2Id;
    }

    public void setStudent2Id(Long student2Id) {
        this.student2Id = student2Id;
    }

    public String getStudent2Name() {
        return student2Name;
    }

    public void setStudent2Name(String student2Name) {
        this.student2Name = student2Name;
    }

    public Long getSkill1Id() {
        return skill1Id;
    }

    public void setSkill1Id(Long skill1Id) {
        this.skill1Id = skill1Id;
    }

    public String getSkill1Name() {
        return skill1Name;
    }

    public void setSkill1Name(String skill1Name) {
        this.skill1Name = skill1Name;
    }

    public Long getSkill2Id() {
        return skill2Id;
    }

    public void setSkill2Id(Long skill2Id) {
        this.skill2Id = skill2Id;
    }

    public String getSkill2Name() {
        return skill2Name;
    }

    public void setSkill2Name(String skill2Name) {
        this.skill2Name = skill2Name;
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

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDateTime completionDate) {
        this.completionDate = completionDate;
    }

    public boolean isReviewedByCurrentStudent() {
        return isReviewedByCurrentStudent;
    }

    public void setReviewedByCurrentStudent(boolean reviewedByCurrentStudent) {
        isReviewedByCurrentStudent = reviewedByCurrentStudent;
    }
}
