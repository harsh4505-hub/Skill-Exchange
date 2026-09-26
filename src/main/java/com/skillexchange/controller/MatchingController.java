package com.skillexchange.controller;

import com.skillexchange.dto.ApiResponse;
import com.skillexchange.dto.MatchResultDto;
import com.skillexchange.service.AuthService;
import com.skillexchange.service.MatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for the Skill Matching Algorithm.
 */
@RestController
@RequestMapping("/api/matches")
public class MatchingController {

    @Autowired
    private MatchingService matchingService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MatchResultDto>>> getMyMatches() {
        Long currentUserId = authService.getCurrentUserId();
        List<MatchResultDto> matches = matchingService.findMatchesForStudent(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Matches calculated successfully", matches));
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<ApiResponse<List<MatchResultDto>>> getMatchesForStudent(@PathVariable Long studentId) {
        List<MatchResultDto> matches = matchingService.findMatchesForStudent(studentId);
        return ResponseEntity.ok(ApiResponse.ok("Matches calculated for student", matches));
    }
}
