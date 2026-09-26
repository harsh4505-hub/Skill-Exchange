package com.skillexchange.dto;

public class UserSkillDto {
    private Long id;
    private Long skillId;
    private String skillName;
    private Long categoryId;
    private String categoryName;
    private String levelOrUrgency; // proficiencyLevel for teaching, urgencyLevel for learning
    private boolean verified;
    private String verificationStatus; // NOT_VERIFIED, PENDING, VERIFIED, REJECTED, NEEDS_RESUBMISSION
    private String proofDocumentUrl;
    private String notes;

    public UserSkillDto() {
    }

    public UserSkillDto(Long id, Long skillId, String skillName, Long categoryId, String categoryName,
                        String levelOrUrgency, boolean verified, String proofDocumentUrl, String notes) {
        this.id = id;
        this.skillId = skillId;
        this.skillName = skillName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.levelOrUrgency = levelOrUrgency;
        this.verified = verified;
        this.verificationStatus = verified ? "VERIFIED" : "NOT_VERIFIED";
        this.proofDocumentUrl = proofDocumentUrl;
        this.notes = notes;
    }

    public UserSkillDto(Long id, Long skillId, String skillName, Long categoryId, String categoryName,
                        String levelOrUrgency, boolean verified, String verificationStatus, String proofDocumentUrl, String notes) {
        this.id = id;
        this.skillId = skillId;
        this.skillName = skillName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.levelOrUrgency = levelOrUrgency;
        this.verified = verified;
        this.verificationStatus = verificationStatus != null ? verificationStatus : (verified ? "VERIFIED" : "NOT_VERIFIED");
        this.proofDocumentUrl = proofDocumentUrl;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getLevelOrUrgency() {
        return levelOrUrgency;
    }

    public void setLevelOrUrgency(String levelOrUrgency) {
        this.levelOrUrgency = levelOrUrgency;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getProofDocumentUrl() {
        return proofDocumentUrl;
    }

    public void setProofDocumentUrl(String proofDocumentUrl) {
        this.proofDocumentUrl = proofDocumentUrl;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
