package com.skillexchange.dto;

import java.util.List;

public class MatchResultDto {
    private Long studentId;
    private Long userId;
    private String studentName;
    private String college;
    private String department;
    private String yearOfStudy;
    private String avatarUrl;
    private Double averageRating;
    private boolean isVerified;

    // Matching details
    private String skillTheyTeachYou;  // What you want to learn, and they can teach
    private Long skillTheyTeachYouId;
    private String skillYouTeachThem;  // What they want to learn, and you can teach (if mutual)
    private Long skillYouTeachThemId;
    private boolean isMutualMatch;     // Both can exchange skills directly with each other!

    private String categoryName;
    private List<String> categories;
    private List<UserSkillDto> teachingSkills;
    private List<UserSkillDto> learningSkills;

    private int matchPercentage;      // Calculated 0-100% using weighted formula
    private String matchReason;        // Explainable breakdown description

    public MatchResultDto() {
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getCollege() {
        return college;
    }

    public void setCollege(String college) {
        this.college = college;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(String yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public String getSkillTheyTeachYou() {
        return skillTheyTeachYou;
    }

    public void setSkillTheyTeachYou(String skillTheyTeachYou) {
        this.skillTheyTeachYou = skillTheyTeachYou;
    }

    public Long getSkillTheyTeachYouId() {
        return skillTheyTeachYouId;
    }

    public void setSkillTheyTeachYouId(Long skillTheyTeachYouId) {
        this.skillTheyTeachYouId = skillTheyTeachYouId;
    }

    public String getSkillYouTeachThem() {
        return skillYouTeachThem;
    }

    public void setSkillYouTeachThem(String skillYouTeachThem) {
        this.skillYouTeachThem = skillYouTeachThem;
    }

    public Long getSkillYouTeachThemId() {
        return skillYouTeachThemId;
    }

    public void setSkillYouTeachThemId(Long skillYouTeachThemId) {
        this.skillYouTeachThemId = skillYouTeachThemId;
    }

    public boolean isMutualMatch() {
        return isMutualMatch;
    }

    public void setMutualMatch(boolean mutualMatch) {
        isMutualMatch = mutualMatch;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories;
    }

    public List<UserSkillDto> getTeachingSkills() {
        return teachingSkills;
    }

    public void setTeachingSkills(List<UserSkillDto> teachingSkills) {
        this.teachingSkills = teachingSkills;
    }

    public List<UserSkillDto> getLearningSkills() {
        return learningSkills;
    }

    public void setLearningSkills(List<UserSkillDto> learningSkills) {
        this.learningSkills = learningSkills;
    }

    public int getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(int matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public void setMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }
}

