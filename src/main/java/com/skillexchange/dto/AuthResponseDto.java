package com.skillexchange.dto;

public class AuthResponseDto {
    private boolean authenticated;
    private String message;
    private Long userId;
    private String email;
    private String role;
    private String fullName;
    private boolean requiresVerification;
    private boolean emailVerified;

    public AuthResponseDto() {
    }

    public AuthResponseDto(boolean authenticated, String message, Long userId, String email, String role, String fullName) {
        this.authenticated = authenticated;
        this.message = message;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.requiresVerification = false;
        this.emailVerified = true;
    }

    public AuthResponseDto(boolean authenticated, String message, Long userId, String email, String role, String fullName, boolean requiresVerification, boolean emailVerified) {
        this.authenticated = authenticated;
        this.message = message;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.requiresVerification = requiresVerification;
        this.emailVerified = emailVerified;
    }

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public boolean isRequiresVerification() {
        return requiresVerification;
    }

    public void setRequiresVerification(boolean requiresVerification) {
        this.requiresVerification = requiresVerification;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
}
