package com.skillexchange.service;

import com.skillexchange.dto.StudentProfileDto;
import com.skillexchange.dto.UserSkillDto;
import com.skillexchange.entity.*;
import com.skillexchange.exception.BadRequestException;
import com.skillexchange.exception.DuplicateResourceException;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * StudentProfileService handles student biography, academic credentials,
 * teaching skills, and learning goals.
 */
@Service
public class StudentProfileService {

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserTeachingSkillRepository teachingSkillRepository;

    @Autowired
    private UserLearningSkillRepository learningSkillRepository;

    public StudentProfile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));
    }

    public StudentProfileDto getProfileDto(Long userId) {
        StudentProfile profile = getProfileByUserId(userId);
        return mapToDto(profile);
    }

    @Transactional
    public StudentProfileDto updateProfile(Long userId, StudentProfileDto dto) {
        StudentProfile profile = getProfileByUserId(userId);

        if (dto.getFullName() != null && !dto.getFullName().trim().isEmpty()) {
            profile.setFullName(dto.getFullName().trim());
        }
        if (dto.getCollege() != null && !dto.getCollege().trim().isEmpty()) {
            profile.setCollege(dto.getCollege().trim());
        }
        if (dto.getDepartment() != null && !dto.getDepartment().trim().isEmpty()) {
            profile.setDepartment(dto.getDepartment().trim());
        }
        if (dto.getYearOfStudy() != null && !dto.getYearOfStudy().trim().isEmpty()) {
            profile.setYearOfStudy(dto.getYearOfStudy().trim());
        }
        if (dto.getPhone() != null) {
            profile.setPhone(dto.getPhone().trim());
        }
        if (dto.getBio() != null) {
            profile.setBio(dto.getBio().trim());
        }
        if (dto.getAvatarUrl() != null && !dto.getAvatarUrl().trim().isEmpty()) {
            profile.setAvatarUrl(dto.getAvatarUrl().trim());
        }

        return mapToDto(profileRepository.save(profile));
    }

    @Transactional
    public UserSkillDto addTeachingSkill(Long userId, Long skillId, String proficiencyLevel) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + skillId));

        if (teachingSkillRepository.existsByUserIdAndSkillId(userId, skillId)) {
            throw new DuplicateResourceException("You have already added this skill to your teaching list");
        }

        UserTeachingSkill teachingSkill = new UserTeachingSkill();
        teachingSkill.setUser(user);
        teachingSkill.setSkill(skill);
        teachingSkill.setProficiencyLevel(proficiencyLevel != null ? proficiencyLevel : "Intermediate");
        teachingSkill.setVerified(false);

        UserTeachingSkill saved = teachingSkillRepository.save(teachingSkill);
        return new UserSkillDto(
                saved.getId(),
                skill.getId(),
                skill.getName(),
                skill.getCategory().getId(),
                skill.getCategory().getName(),
                saved.getProficiencyLevel(),
                saved.isVerified(),
                saved.getVerificationStatus(),
                saved.getProofDocumentUrl(),
                saved.getVerificationNotes()
        );
    }

    @Transactional
    public void removeTeachingSkill(Long userId, Long skillId) {
        UserTeachingSkill ts = teachingSkillRepository.findByUserIdAndSkillId(userId, skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Teaching skill not found for user"));
        teachingSkillRepository.delete(ts);
    }

    @Transactional
    public UserSkillDto addLearningSkill(Long userId, Long skillId, String urgencyLevel) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + skillId));

        if (learningSkillRepository.existsByUserIdAndSkillId(userId, skillId)) {
            throw new DuplicateResourceException("You have already added this skill to your learning list");
        }

        UserLearningSkill learningSkill = new UserLearningSkill();
        learningSkill.setUser(user);
        learningSkill.setSkill(skill);
        learningSkill.setUrgencyLevel(urgencyLevel != null ? urgencyLevel : "Medium");

        UserLearningSkill saved = learningSkillRepository.save(learningSkill);
        return new UserSkillDto(
                saved.getId(),
                skill.getId(),
                skill.getName(),
                skill.getCategory().getId(),
                skill.getCategory().getName(),
                saved.getUrgencyLevel(),
                false,
                null,
                saved.getNotes()
        );
    }

    @Transactional
    public void removeLearningSkill(Long userId, Long skillId) {
        UserLearningSkill ls = learningSkillRepository.findByUserIdAndSkillId(userId, skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning skill not found for user"));
        learningSkillRepository.delete(ls);
    }

    public List<StudentProfileDto> searchProfiles(String query, String category, Double minRating,
                                                  Boolean verifiedOnly, String department, String year) {
        List<StudentProfile> profiles;
        if (query != null && !query.trim().isEmpty()) {
            profiles = profileRepository.searchProfiles(query.trim());
        } else {
            profiles = profileRepository.findByIsBlockedFalse();
        }

        return profiles.stream()
                .filter(p -> !"ROLE_ADMIN".equals(p.getUser().getRole()))
                .filter(p -> minRating == null || p.getAverageRating() >= minRating)
                .filter(p -> verifiedOnly == null || !verifiedOnly || p.isVerified())
                .filter(p -> department == null || department.isEmpty() || p.getDepartment().equalsIgnoreCase(department))
                .filter(p -> year == null || year.isEmpty() || p.getYearOfStudy().equalsIgnoreCase(year))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public StudentProfileDto mapToDto(StudentProfile profile) {
        StudentProfileDto dto = new StudentProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());
        dto.setEmail(profile.getUser().getEmail());
        dto.setFullName(profile.getFullName());
        dto.setCollege(profile.getCollege());
        dto.setDepartment(profile.getDepartment());
        dto.setYearOfStudy(profile.getYearOfStudy());
        dto.setPhone(profile.getPhone());
        dto.setBio(profile.getBio());
        dto.setAvatarUrl(profile.getAvatarUrl());
        dto.setVerified(profile.isVerified());
        dto.setAverageRating(profile.getAverageRating());
        dto.setCompletedExchangesCount(profile.getCompletedExchangesCount());
        dto.setBlocked(profile.isBlocked());

        List<UserTeachingSkill> teaching = teachingSkillRepository.findByUserId(profile.getUser().getId());
        dto.setTeachingSkills(teaching.stream().map(ts -> new UserSkillDto(
                ts.getId(),
                ts.getSkill().getId(),
                ts.getSkill().getName(),
                ts.getSkill().getCategory().getId(),
                ts.getSkill().getCategory().getName(),
                ts.getProficiencyLevel(),
                ts.isVerified(),
                ts.getVerificationStatus(),
                ts.getProofDocumentUrl(),
                ts.getVerificationNotes()
        )).collect(Collectors.toList()));

        List<UserLearningSkill> learning = learningSkillRepository.findByUserId(profile.getUser().getId());
        dto.setLearningSkills(learning.stream().map(ls -> new UserSkillDto(
                ls.getId(),
                ls.getSkill().getId(),
                ls.getSkill().getName(),
                ls.getSkill().getCategory().getId(),
                ls.getSkill().getCategory().getName(),
                ls.getUrgencyLevel(),
                false,
                null,
                ls.getNotes()
        )).collect(Collectors.toList()));

        return dto;
    }
}
