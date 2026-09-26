package com.skillexchange.dto;

public class AuthResponseDto {
    private boolean authenticated;
    private String message;
    private Long userId;
    private String email;
    private String role;
    private String fullName;

    public AuthResponseDto() {
    }

    public AuthResponseDto(boolean authenticated, String message, Long userId, String email, String role, String fullName) {
        this.authenticated = authenticated;
        this.message = message;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
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
}
