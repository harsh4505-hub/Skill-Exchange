package com.skillexchange.controller;

import com.skillexchange.dto.ApiResponse;
import com.skillexchange.dto.AuthRequestDto;
import com.skillexchange.dto.AuthResponseDto;
import com.skillexchange.dto.RegisterRequestDto;
import com.skillexchange.entity.User;
import com.skillexchange.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication, registration, session checks, and logout.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDto>> register(@Valid @RequestBody RegisterRequestDto dto) {
        AuthResponseDto response = authService.registerStudent(dto);
        return ResponseEntity.ok(ApiResponse.ok("Registration initiated! Please verify your official college email.", response));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<AuthResponseDto>> verifyEmail(@Valid @RequestBody com.skillexchange.dto.VerifyEmailRequestDto dto) {
        AuthResponseDto response = authService.verifyEmail(dto);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<AuthResponseDto>> resendOtp(@Valid @RequestBody com.skillexchange.dto.ResendOtpRequestDto dto) {
        AuthResponseDto response = authService.resendOtp(dto);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(@Valid @RequestBody AuthRequestDto dto) {
        AuthResponseDto response = authService.login(dto);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/current-user")
    public ResponseEntity<ApiResponse<AuthResponseDto>> getCurrentUser() {
        try {
            User user = authService.getCurrentUser();
            String fullName = user.getEmail();
            if (user.getStudentProfile() != null) {
                fullName = user.getStudentProfile().getFullName();
            } else if ("ROLE_ADMIN".equals(user.getRole())) {
                fullName = "System Administrator";
            }
            AuthResponseDto response = new AuthResponseDto(
                    true,
                    "Current authenticated user",
                    user.getId(),
                    user.getEmail(),
                    user.getRole(),
                    fullName
            );
            return ResponseEntity.ok(ApiResponse.ok("Authenticated", response));
        } catch (Exception ex) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Not authenticated", null));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
    }
}
