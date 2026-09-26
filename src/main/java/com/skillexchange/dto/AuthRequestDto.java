package com.skillexchange.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthRequestDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid college email address")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@mgmmumbai\\.ac\\.in$", flags = Pattern.Flag.CASE_INSENSITIVE, message = "Please use your official college email address ending with @mgmmumbai.ac.in.")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    public AuthRequestDto() {
    }

    public AuthRequestDto(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
