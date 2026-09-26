package com.skillexchange.dto;

import java.util.ArrayList;
import java.util.List;

public class StudentProfileDto {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private String college;
    private String department;
    private String yearOfStudy;
    private String phone;
    private String bio;
    private String avatarUrl;
    private boolean isVerified;
    private Double averageRating;
    private Integer completedExchangesCount;
    private boolean isBlocked;
    private List<UserSkillDto> teachingSkills = new ArrayList<>();
    private List<UserSkillDto> learningSkills = new ArrayList<>();

    public StudentProfileDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getCompletedExchangesCount() {
        return completedExchangesCount;
    }

    public void setCompletedExchangesCount(Integer completedExchangesCount) {
        this.completedExchangesCount = completedExchangesCount;
    }

    public boolean isBlocked() {
        return isBlocked;
    }

    public void setBlocked(boolean blocked) {
        isBlocked = blocked;
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
}
