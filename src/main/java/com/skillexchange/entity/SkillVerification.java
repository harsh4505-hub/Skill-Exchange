package com.skillexchange.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * SkillVerification Entity for tracking skill-specific proof submissions
 * (Certificate optional, Projects & Experience compulsory) and administrative audit decisions.
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

    // --- Section A: Certificate (Optional) ---
    @Column(name = "certificate_name", length = 150)
    private String certificateName;

    @Column(name = "certificate_url", length = 500)
    private String certificateUrl;

    // --- Section B: Projects (Compulsory) ---
    @Column(name = "project_title", nullable = false, length = 200)
    private String projectTitle;

    @Column(name = "project_description", columnDefinition = "TEXT", nullable = false)
    private String projectDescription;

    @Column(name = "project_technologies", length = 255, nullable = false)
    private String projectTechnologies;

    @Column(name = "project_link", length = 500)
    private String projectLink;

    @Column(name = "project_proof_url", length = 500)
    private String projectProofUrl;

    // --- Section C: Experience (Compulsory) ---
    @Column(name = "experience_title", nullable = false, length = 150)
    private String experienceTitle;

    @Column(name = "experience_organization", nullable = false, length = 150)
    private String experienceOrganization;

    @Column(name = "experience_description", columnDefinition = "TEXT", nullable = false)
    private String experienceDescription;

    @Column(name = "experience_duration", length = 50)
    private String experienceDuration;

    @Column(name = "experience_start_date", nullable = false, length = 50)
    private String experienceStartDate;

    @Column(name = "experience_end_date", nullable = false, length = 50)
    private String experienceEndDate;

    // --- Audit & Status ---
    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, VERIFIED, REJECTED, NEEDS_RESUBMISSION

    @Column(name = "admin_comment", columnDefinition = "TEXT")
    private String adminComment;

    @Column(name = "submission_date", nullable = false)
    private LocalDateTime submissionDate = LocalDateTime.now();

    @Column(name = "reviewed_date")
    private LocalDateTime reviewedDate;

    public SkillVerification() {
    }

    public SkillVerification(User student, Skill skill, String certificateName, String certificateUrl, String projectDescription) {
        this.student = student;
        this.skill = skill;
        this.certificateName = certificateName;
        this.certificateUrl = certificateUrl;
        this.projectTitle = "Python Problem Solving & Scripting";
        this.projectDescription = projectDescription != null ? projectDescription : "Python project and problem solving.";
        this.projectTechnologies = "Python 3, Data Structures";
        this.projectLink = "https://github.com/raza/python-practice";
        this.projectProofUrl = certificateUrl;
        this.experienceTitle = "Python Peer Mentor";
        this.experienceOrganization = "MGM Coding Club";
        this.experienceDescription = "Mentored 1st year students in Python programming fundamentals.";
        this.experienceDuration = "6 Months";
        this.experienceStartDate = "2025-08-01";
        this.experienceEndDate = "2026-02-01";
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

    public String getCertificateName() {
        return certificateName;
    }

    public void setCertificateName(String certificateName) {
        this.certificateName = certificateName;
    }

    public String getCertificateUrl() {
        return certificateUrl;
    }

    public void setCertificateUrl(String certificateUrl) {
        this.certificateUrl = certificateUrl;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }

    public String getProjectDescription() {
        return projectDescription;
    }

    public void setProjectDescription(String projectDescription) {
        this.projectDescription = projectDescription;
    }

    public String getProjectTechnologies() {
        return projectTechnologies;
    }

    public void setProjectTechnologies(String projectTechnologies) {
        this.projectTechnologies = projectTechnologies;
    }

    public String getProjectLink() {
        return projectLink;
    }

    public void setProjectLink(String projectLink) {
        this.projectLink = projectLink;
    }

    public String getProjectProofUrl() {
        return projectProofUrl;
    }

    public void setProjectProofUrl(String projectProofUrl) {
        this.projectProofUrl = projectProofUrl;
    }

    public String getExperienceTitle() {
        return experienceTitle;
    }

    public void setExperienceTitle(String experienceTitle) {
        this.experienceTitle = experienceTitle;
    }

    public String getExperienceOrganization() {
        return experienceOrganization;
    }

    public void setExperienceOrganization(String experienceOrganization) {
        this.experienceOrganization = experienceOrganization;
    }

    public String getExperienceDescription() {
        return experienceDescription;
    }

    public void setExperienceDescription(String experienceDescription) {
        this.experienceDescription = experienceDescription;
    }

    public String getExperienceDuration() {
        return experienceDuration;
    }

    public void setExperienceDuration(String experienceDuration) {
        this.experienceDuration = experienceDuration;
    }

    public String getExperienceStartDate() {
        return experienceStartDate;
    }

    public void setExperienceStartDate(String experienceStartDate) {
        this.experienceStartDate = experienceStartDate;
    }

    public String getExperienceEndDate() {
        return experienceEndDate;
    }

    public void setExperienceEndDate(String experienceEndDate) {
        this.experienceEndDate = experienceEndDate;
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
