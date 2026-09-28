package com.skillexchange.service;

import com.skillexchange.dto.AdminStatsDto;
import com.skillexchange.dto.StudentProfileDto;
import com.skillexchange.entity.StudentProfile;
import com.skillexchange.entity.User;
import com.skillexchange.exception.BadRequestException;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AdminService aggregates platform-wide analytics, user moderation,
 * and system oversight capabilities.
 */
@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private ExchangeRepository exchangeRepository;

    @Autowired
    private SkillVerificationRepository verificationRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private StudentProfileService profileService;

    public AdminStatsDto getPlatformStats() {
        long totalStudents = userRepository.countByRole("ROLE_STUDENT");
        long totalSkills = skillRepository.count();
        long totalExchanges = exchangeRepository.count();
        long completedExchanges = exchangeRepository.countByStatus("COMPLETED");
        long pendingVerifications = verificationRepository.countByStatus("PENDING");
        long pendingReports = reportRepository.countByStatus("PENDING");

        return new AdminStatsDto(
                totalStudents,
                totalSkills,
                totalExchanges,
                completedExchanges,
                pendingVerifications,
                pendingReports
        );
    }

    public List<StudentProfileDto> getAllStudents() {
        return profileRepository.findAll().stream()
                .filter(p -> !p.getUser().isAdmin())
                .map(profileService::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        if (user.isSuperAdmin()) {
            throw new BadRequestException("The permanent Super Admin account cannot be deactivated or suspended.");
        }
        user.setActive(!user.isActive());
        userRepository.save(user);
        return user.isActive();
    }

    @Transactional
    public String updateUserRole(Long userId, String requestedRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        if (user.isSuperAdmin()) {
            throw new BadRequestException("The permanent Super Admin role cannot be demoted or modified.");
        }

        String normalized = requestedRole != null ? requestedRole.trim().toUpperCase() : "ROLE_STUDENT";
        String targetRole = User.ROLE_STUDENT;
        if ("ADMIN".equals(normalized) || User.ROLE_ADMIN.equals(normalized)) {
            targetRole = User.ROLE_ADMIN;
        } else if ("STUDENT".equals(normalized) || User.ROLE_STUDENT.equals(normalized)) {
            targetRole = User.ROLE_STUDENT;
        } else {
            throw new BadRequestException("Invalid role. Only ADMIN and STUDENT roles can be assigned.");
        }

        user.setRole(targetRole);
        userRepository.save(user);
        return targetRole;
    }

    @Transactional
    public boolean toggleBlockStudent(Long profileId) {
        StudentProfile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found: " + profileId));
        if (profile.getUser().isSuperAdmin()) {
            throw new BadRequestException("The permanent Super Admin cannot be blocked.");
        }
        profile.setBlocked(!profile.isBlocked());
        profileRepository.save(profile);
        return profile.isBlocked();
    }
}
