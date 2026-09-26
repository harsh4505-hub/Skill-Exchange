package com.skillexchange.controller;

import com.skillexchange.dto.ApiResponse;
import com.skillexchange.dto.StudentProfileDto;
import com.skillexchange.dto.UserSkillDto;
import com.skillexchange.entity.User;
import com.skillexchange.service.AuthService;
import com.skillexchange.service.StudentProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for student profiles and skill associations.
 */
@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentProfileService profileService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentProfileDto>>> getAllStudents(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Boolean verifiedOnly,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String year) {
        List<StudentProfileDto> students = profileService.searchProfiles(query, category, minRating, verifiedOnly, department, year);
        return ResponseEntity.ok(ApiResponse.ok("Students retrieved successfully", students));
    }

    @GetMapping("/profile/me")
    public ResponseEntity<ApiResponse<StudentProfileDto>> getMyProfile() {
        Long currentUserId = authService.getCurrentUserId();
        StudentProfileDto profile = profileService.getProfileDto(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved", profile));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentProfileDto>> getStudentById(@PathVariable Long id) {
        StudentProfileDto profile = profileService.getProfileDto(id);
        return ResponseEntity.ok(ApiResponse.ok("Student retrieved", profile));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentProfileDto>> updateProfile(
            @PathVariable Long id,
            @RequestBody StudentProfileDto dto) {
        Long currentUserId = authService.getCurrentUserId();
        User currentUser = authService.getCurrentUser();

        // Ensure student can only update their own profile unless admin
        if (!currentUserId.equals(id) && !"ROLE_ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).body(ApiResponse.error("You cannot update another student's profile"));
        }

        StudentProfileDto updated = profileService.updateProfile(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @PostMapping("/skills/teach")
    public ResponseEntity<ApiResponse<UserSkillDto>> addTeachingSkill(
            @RequestParam Long skillId,
            @RequestParam(defaultValue = "Intermediate") String proficiencyLevel) {
        Long currentUserId = authService.getCurrentUserId();
        UserSkillDto skill = profileService.addTeachingSkill(currentUserId, skillId, proficiencyLevel);
        return ResponseEntity.ok(ApiResponse.ok("Teaching skill added successfully", skill));
    }

    @DeleteMapping("/skills/teach/{skillId}")
    public ResponseEntity<ApiResponse<String>> removeTeachingSkill(@PathVariable Long skillId) {
        Long currentUserId = authService.getCurrentUserId();
        profileService.removeTeachingSkill(currentUserId, skillId);
        return ResponseEntity.ok(ApiResponse.ok("Teaching skill removed successfully"));
    }

    @PostMapping("/skills/learn")
    public ResponseEntity<ApiResponse<UserSkillDto>> addLearningSkill(
            @RequestParam Long skillId,
            @RequestParam(defaultValue = "Medium") String urgencyLevel) {
        Long currentUserId = authService.getCurrentUserId();
        UserSkillDto skill = profileService.addLearningSkill(currentUserId, skillId, urgencyLevel);
        return ResponseEntity.ok(ApiResponse.ok("Learning skill added successfully", skill));
    }

    @DeleteMapping("/skills/learn/{skillId}")
    public ResponseEntity<ApiResponse<String>> removeLearningSkill(@PathVariable Long skillId) {
        Long currentUserId = authService.getCurrentUserId();
        profileService.removeLearningSkill(currentUserId, skillId);
        return ResponseEntity.ok(ApiResponse.ok("Learning skill removed successfully"));
    }
}
