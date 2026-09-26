package com.skillexchange.controller;

import com.skillexchange.dto.ApiResponse;
import com.skillexchange.dto.ReportDto;
import com.skillexchange.service.AuthService;
import com.skillexchange.service.ReportBlockService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for community safety reports and peer blocking.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportBlockController {

    @Autowired
    private ReportBlockService reportBlockService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReportDto>> reportUser(@Valid @RequestBody ReportDto dto) {
        Long currentUserId = authService.getCurrentUserId();
        ReportDto report = reportBlockService.reportUser(currentUserId, dto);
        return ResponseEntity.ok(ApiResponse.ok("User reported successfully. Admin will review.", report));
    }

    @PostMapping("/block")
    public ResponseEntity<ApiResponse<String>> blockUser(@RequestParam Long blockedId) {
        Long currentUserId = authService.getCurrentUserId();
        reportBlockService.blockUser(currentUserId, blockedId);
        return ResponseEntity.ok(ApiResponse.ok("User has been blocked. They can no longer contact you."));
    }

    @DeleteMapping("/block/{blockedId}")
    public ResponseEntity<ApiResponse<String>> unblockUser(@PathVariable Long blockedId) {
        Long currentUserId = authService.getCurrentUserId();
        reportBlockService.unblockUser(currentUserId, blockedId);
        return ResponseEntity.ok(ApiResponse.ok("User has been unblocked."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportDto>>> getAllReports() {
        return ResponseEntity.ok(ApiResponse.ok("Reports retrieved", reportBlockService.getAllReports()));
    }
}
