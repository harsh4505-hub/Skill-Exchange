package com.skillexchange.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object for requesting a new verification code.
 */
public class ResendOtpRequestDto {

    @NotBlank(message = "College email is required")
    private String email;

    public ResendOtpRequestDto() {
    }

    public ResendOtpRequestDto(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
