package com.skillexchange.service;

import com.skillexchange.dto.AdminStatsDto;
import com.skillexchange.dto.StudentProfileDto;
import com.skillexchange.entity.StudentProfile;
import com.skillexchange.entity.User;
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
                .filter(p -> !"ROLE_ADMIN".equals(p.getUser().getRole()))
                .map(profileService::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return user.isActive();
    }

    @Transactional
    public boolean toggleBlockStudent(Long profileId) {
        StudentProfile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found: " + profileId));
        profile.setBlocked(!profile.isBlocked());
        profileRepository.save(profile);
        return profile.isBlocked();
    }
}
