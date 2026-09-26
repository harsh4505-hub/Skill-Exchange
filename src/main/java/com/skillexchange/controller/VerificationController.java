package com.skillexchange.controller;

import com.skillexchange.dto.ApiResponse;
import com.skillexchange.dto.SkillVerificationDto;
import com.skillexchange.service.AuthService;
import com.skillexchange.service.SkillVerificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for skill proof verification submissions and admin decisioning.
 */
@RestController
@RequestMapping("/api/verifications")
public class VerificationController {

    @Autowired
    private SkillVerificationService verificationService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<ApiResponse<SkillVerificationDto>> submitVerification(@Valid @RequestBody SkillVerificationDto dto) {
        Long currentUserId = authService.getCurrentUserId();
        SkillVerificationDto submitted = verificationService.submitVerification(currentUserId, dto);
        return ResponseEntity.ok(ApiResponse.ok("Verification submitted successfully", submitted));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillVerificationDto>>> getMyVerifications() {
        Long currentUserId = authService.getCurrentUserId();
        List<SkillVerificationDto> list = verificationService.getStudentVerifications(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Verifications retrieved", list));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<SkillVerificationDto>>> getPendingVerifications() {
        List<SkillVerificationDto> list = verificationService.getAllPendingVerifications();
        return ResponseEntity.ok(ApiResponse.ok("Pending verifications", list));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<SkillVerificationDto>> approveVerification(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String comment = body != null ? body.get("adminComment") : null;
        SkillVerificationDto approved = verificationService.approveVerification(id, comment);
        return ResponseEntity.ok(ApiResponse.ok("Verification approved! Verified badge awarded.", approved));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<SkillVerificationDto>> rejectVerification(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String comment = body != null ? body.get("adminComment") : null;
        SkillVerificationDto rejected = verificationService.rejectVerification(id, comment);
        return ResponseEntity.ok(ApiResponse.ok("Verification rejected.", rejected));
    }
}
