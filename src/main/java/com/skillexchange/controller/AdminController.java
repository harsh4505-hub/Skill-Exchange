package com.skillexchange.controller;

import com.skillexchange.dto.*;
import com.skillexchange.service.AdminService;
import com.skillexchange.service.ReportBlockService;
import com.skillexchange.service.SkillVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for administrator dashboard oversight, user status toggles,
 * verification audit queues, and safety report resolutions.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private SkillVerificationService verificationService;

    @Autowired
    private ReportBlockService reportBlockService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getPlatformStats() {
        return ResponseEntity.ok(ApiResponse.ok("Platform statistics", adminService.getPlatformStats()));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<StudentProfileDto>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.ok("All registered students", adminService.getAllStudents()));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<String>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        String role = body.getOrDefault("role", "ROLE_STUDENT");
        String updatedRole = adminService.updateUserRole(userId, role);
        return ResponseEntity.ok(ApiResponse.ok("User role updated successfully to " + updatedRole, updatedRole));
    }

    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<Boolean>> toggleUserActiveStatus(@PathVariable Long userId) {
        boolean active = adminService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.ok("User status updated. Active: " + active, active));
    }

    @PutMapping("/students/{profileId}/toggle-block")
    public ResponseEntity<ApiResponse<Boolean>> toggleBlockStudent(@PathVariable Long profileId) {
        boolean blocked = adminService.toggleBlockStudent(profileId);
        return ResponseEntity.ok(ApiResponse.ok("Student blocked state updated: " + blocked, blocked));
    }

    @GetMapping("/verifications")
    public ResponseEntity<ApiResponse<List<SkillVerificationDto>>> getAllVerifications() {
        return ResponseEntity.ok(ApiResponse.ok("Verifications list", verificationService.getAllVerifications()));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<ReportDto>>> getAllReports() {
        return ResponseEntity.ok(ApiResponse.ok("Reports list", reportBlockService.getAllReports()));
    }

    @PutMapping("/reports/{id}")
    public ResponseEntity<ApiResponse<ReportDto>> updateReport(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "RESOLVED");
        String adminNotes = body.get("adminNotes");
        ReportDto updated = reportBlockService.updateReportStatus(id, status, adminNotes);
        return ResponseEntity.ok(ApiResponse.ok("Report status updated", updated));
    }
}
