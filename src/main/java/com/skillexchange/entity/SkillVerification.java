package com.skillexchange.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * SkillVerification Entity for tracking certificate/proof submissions
 * and administrative verification status.
 */
@Entity
@Table(name = "skill_verifications")
public class SkillVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "document_name", nullable = false, length = 150)
    private String documentName;

    @Column(name = "document_path", nullable = false, length = 500)
    private String documentPath;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(name = "admin_comment", columnDefinition = "TEXT")
    private String adminComment;

    @Column(name = "submission_date", nullable = false)
    private LocalDateTime submissionDate = LocalDateTime.now();

    @Column(name = "reviewed_date")
    private LocalDateTime reviewedDate;

    public SkillVerification() {
    }

    public SkillVerification(User student, Skill skill, String documentName, String documentPath, String description) {
        this.student = student;
        this.skill = skill;
        this.documentName = documentName;
        this.documentPath = documentPath;
        this.description = description;
        this.status = "PENDING";
        this.submissionDate = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public String getDocumentPath() {
        return documentPath;
    }

    public void setDocumentPath(String documentPath) {
        this.documentPath = documentPath;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminComment() {
        return adminComment;
    }

    public void setAdminComment(String adminComment) {
        this.adminComment = adminComment;
    }

    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
    }

    public LocalDateTime getReviewedDate() {
        return reviewedDate;
    }

    public void setReviewedDate(LocalDateTime reviewedDate) {
        this.reviewedDate = reviewedDate;
    }
}
