package com.skillexchange.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class SkillVerificationDto {
    private Long id;

    private Long studentId;
    private String studentName;
    private String studentEmail;

    @NotNull(message = "Skill is required")
    private Long skillId;
    private String skillName;

    // --- Section A: Certificate (Optional) ---
    private String certificateName;
    private String certificateUrl;

    // --- Section B: Projects (Compulsory) ---
    @NotBlank(message = "Project title is required")
    private String projectTitle;

    @NotBlank(message = "Project description is required")
    private String projectDescription;

    @NotBlank(message = "Technologies/tools used are required")
    private String projectTechnologies;

    private String projectLink;
    private String projectProofUrl;

    // --- Section C: Experience (Compulsory) ---
    @NotBlank(message = "Experience role/title is required")
    private String experienceTitle;

    @NotBlank(message = "Organization name is required")
    private String experienceOrganization;

    @NotBlank(message = "Experience description is required")
    private String experienceDescription;

    private String experienceDuration;

    @NotBlank(message = "Experience start date is required")
    private String experienceStartDate;

    @NotBlank(message = "Experience end date is required")
    private String experienceEndDate;

    // --- Audit & Status ---
    private String status; // PENDING, VERIFIED, REJECTED, NEEDS_RESUBMISSION
    private String adminComment;
    private LocalDateTime submissionDate;
    private LocalDateTime reviewedDate;

    public SkillVerificationDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
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
