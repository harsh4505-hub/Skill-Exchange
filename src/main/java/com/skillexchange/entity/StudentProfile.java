package com.skillexchange.entity;

import jakarta.persistence.*;

/**
 * StudentProfile Entity containing student demographic details,
 * academic info, rating, and exchange statistics.
 */
@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 150)
    private String college;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(name = "year_of_study", nullable = false, length = 20)
    private String yearOfStudy; // "1st Year", "2nd Year", "3rd Year", "4th Year"

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;

    @Column(name = "average_rating", nullable = false)
    private Double averageRating = 0.0;

    @Column(name = "completed_exchanges_count", nullable = false)
    private Integer completedExchangesCount = 0;

    @Column(name = "is_blocked", nullable = false)
    private boolean isBlocked = false;

    public StudentProfile() {
    }

    public StudentProfile(User user, String fullName, String college, String department, String yearOfStudy, String phone) {
        this.user = user;
        this.fullName = fullName;
        this.college = college;
        this.department = department;
        this.yearOfStudy = yearOfStudy;
        this.phone = phone;
        this.isVerified = false;
        this.averageRating = 0.0;
        this.completedExchangesCount = 0;
        this.isBlocked = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
}
