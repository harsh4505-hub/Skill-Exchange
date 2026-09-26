package com.skillexchange.service;

import com.skillexchange.dto.SkillVerificationDto;
import com.skillexchange.entity.*;
import com.skillexchange.exception.BadRequestException;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SkillVerificationService coordinates document proof uploads,
 * 3-tier proof requirements (Certificate optional, Projects & Experience compulsory),
 * administrator approval workflows, and skill-specific badge awarding.
 */
@Service
public class SkillVerificationService {

    @Autowired
    private SkillVerificationRepository verificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserTeachingSkillRepository teachingSkillRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public SkillVerificationDto submitVerification(Long studentId, SkillVerificationDto dto) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        Skill skill = skillRepository.findById(dto.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + dto.getSkillId()));

        // --- BACKEND ENFORCEMENT: Projects & Experience are COMPULSORY, Certificate is OPTIONAL ---
        boolean hasProject = dto.getProjectTitle() != null && !dto.getProjectTitle().trim().isEmpty() &&
                             dto.getProjectDescription() != null && !dto.getProjectDescription().trim().isEmpty() &&
                             dto.getProjectTechnologies() != null && !dto.getProjectTechnologies().trim().isEmpty();

        boolean hasExperience = dto.getExperienceTitle() != null && !dto.getExperienceTitle().trim().isEmpty() &&
                                dto.getExperienceOrganization() != null && !dto.getExperienceOrganization().trim().isEmpty() &&
                                dto.getExperienceDescription() != null && !dto.getExperienceDescription().trim().isEmpty() &&
                                dto.getExperienceStartDate() != null && !dto.getExperienceStartDate().trim().isEmpty() &&
                                dto.getExperienceEndDate() != null && !dto.getExperienceEndDate().trim().isEmpty();

        if (!hasProject || !hasExperience) {
            throw new BadRequestException("Project and experience proof are required to verify this skill. Certificate is optional.");
        }

        // Reuse existing verification or create new
        SkillVerification verification = verificationRepository
                .findByStudentIdAndSkillId(studentId, dto.getSkillId())
                .orElse(new SkillVerification());

        verification.setStudent(student);
        verification.setSkill(skill);

        // Section A: Certificate (Optional)
        verification.setCertificateName(dto.getCertificateName() != null ? dto.getCertificateName().trim() : null);
        verification.setCertificateUrl(dto.getCertificateUrl() != null ? dto.getCertificateUrl().trim() : null);

        // Section B: Projects (Compulsory)
        verification.setProjectTitle(dto.getProjectTitle().trim());
        verification.setProjectDescription(dto.getProjectDescription().trim());
        verification.setProjectTechnologies(dto.getProjectTechnologies().trim());
        verification.setProjectLink(dto.getProjectLink() != null ? dto.getProjectLink().trim() : null);
        verification.setProjectProofUrl(dto.getProjectProofUrl() != null ? dto.getProjectProofUrl().trim() : null);

        // Section C: Experience (Compulsory)
        verification.setExperienceTitle(dto.getExperienceTitle().trim());
        verification.setExperienceOrganization(dto.getExperienceOrganization().trim());
        verification.setExperienceDescription(dto.getExperienceDescription().trim());
        verification.setExperienceDuration(dto.getExperienceDuration() != null ? dto.getExperienceDuration().trim() : null);
        verification.setExperienceStartDate(dto.getExperienceStartDate().trim());
        verification.setExperienceEndDate(dto.getExperienceEndDate().trim());

        verification.setStatus("PENDING");
        verification.setAdminComment(null);
        verification.setSubmissionDate(LocalDateTime.now());
        verification.setReviewedDate(null);

        SkillVerification saved = verificationRepository.save(verification);

        // Update UserTeachingSkill status to PENDING
        teachingSkillRepository.findByUserIdAndSkillId(studentId, skill.getId()).ifPresent(ts -> {
            ts.setVerified(false);
            ts.setVerificationStatus("PENDING");
            teachingSkillRepository.save(ts);
        });

        return mapToDto(saved);
    }

    public List<SkillVerificationDto> getStudentVerifications(Long studentId) {
        return verificationRepository.findByStudentIdOrderBySubmissionDateDesc(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SkillVerificationDto getVerificationByStudentAndSkill(Long studentId, Long skillId) {
        return verificationRepository.findByStudentIdAndSkillId(studentId, skillId)
                .map(this::mapToDto)
                .orElse(null);
    }

    public List<SkillVerificationDto> getAllPendingVerifications() {
        return verificationRepository.findByStatusOrderBySubmissionDateDesc("PENDING").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<SkillVerificationDto> getAllVerifications() {
        return verificationRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SkillVerificationDto approveVerification(Long verificationId, String adminComment) {
        SkillVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification request not found: " + verificationId));

        verification.setStatus("VERIFIED");
        verification.setAdminComment(adminComment != null ? adminComment : "Verified by Admin: Project portfolio and practical experience validated.");
        verification.setReviewedDate(LocalDateTime.now());
        SkillVerification saved = verificationRepository.save(verification);

        // Mark skill as verified in UserTeachingSkill
        teachingSkillRepository.findByUserIdAndSkillId(verification.getStudent().getId(), verification.getSkill().getId())
                .ifPresent(ts -> {
                    ts.setVerified(true);
                    ts.setVerificationStatus("VERIFIED");
                    ts.setProofDocumentUrl(saved.getProjectLink() != null ? saved.getProjectLink() : saved.getCertificateUrl());
                    ts.setVerificationNotes(saved.getAdminComment());
                    teachingSkillRepository.save(ts);
                });

        // Award overall verified badge to student profile if at least one skill verified
        profileRepository.findByUserId(verification.getStudent().getId()).ifPresent(p -> {
            p.setVerified(true);
            profileRepository.save(p);
        });

        // Notify student
        notificationService.createNotification(
                verification.getStudent(),
                "Skill Verification Approved! ✓",
                "Congratulations! Your verification proof for '" + verification.getSkill().getName() + "' was approved. You now hold the ✓ Verified Skill badge!",
                "VERIFICATION_APPROVED",
                saved.getId()
        );

        return mapToDto(saved);
    }

    @Transactional
    public SkillVerificationDto rejectVerification(Long verificationId, String adminComment) {
        SkillVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification request not found: " + verificationId));

        verification.setStatus("REJECTED");
        verification.setAdminComment(adminComment != null ? adminComment : "Verification rejected: Insufficient proof provided.");
        verification.setReviewedDate(LocalDateTime.now());
        SkillVerification saved = verificationRepository.save(verification);

        // Update UserTeachingSkill
        teachingSkillRepository.findByUserIdAndSkillId(verification.getStudent().getId(), verification.getSkill().getId())
                .ifPresent(ts -> {
                    ts.setVerified(false);
                    ts.setVerificationStatus("REJECTED");
                    ts.setVerificationNotes(saved.getAdminComment());
                    teachingSkillRepository.save(ts);
                });

        // Notify student
        notificationService.createNotification(
                verification.getStudent(),
                "Skill Verification Update",
                "Your verification for '" + verification.getSkill().getName() + "' was rejected. Reason: " + verification.getAdminComment(),
                "VERIFICATION_REJECTED",
                saved.getId()
        );

        return mapToDto(saved);
    }

    @Transactional
    public SkillVerificationDto requestResubmission(Long verificationId, String adminComment) {
        SkillVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification request not found: " + verificationId));

        verification.setStatus("NEEDS_RESUBMISSION");
        verification.setAdminComment(adminComment != null ? adminComment : "Please provide additional details on your project repository and work responsibilities.");
        verification.setReviewedDate(LocalDateTime.now());
        SkillVerification saved = verificationRepository.save(verification);

        // Update UserTeachingSkill
        teachingSkillRepository.findByUserIdAndSkillId(verification.getStudent().getId(), verification.getSkill().getId())
                .ifPresent(ts -> {
                    ts.setVerified(false);
                    ts.setVerificationStatus("NEEDS_RESUBMISSION");
                    ts.setVerificationNotes(saved.getAdminComment());
                    teachingSkillRepository.save(ts);
                });

        // Notify student
        notificationService.createNotification(
                verification.getStudent(),
                "Skill Verification Needs Resubmission ⚠",
                "The administrator requested updates on your '" + verification.getSkill().getName() + "' proof: \"" + verification.getAdminComment() + "\". Please update and resubmit.",
                "VERIFICATION_RESUBMISSION",
                saved.getId()
        );

        return mapToDto(saved);
    }

    private SkillVerificationDto mapToDto(SkillVerification v) {
        SkillVerificationDto dto = new SkillVerificationDto();
        dto.setId(v.getId());
        dto.setStudentId(v.getStudent().getId());
        dto.setStudentName(v.getStudent().getStudentProfile() != null ? v.getStudent().getStudentProfile().getFullName() : v.getStudent().getEmail());
        dto.setStudentEmail(v.getStudent().getEmail());
        dto.setSkillId(v.getSkill().getId());
        dto.setSkillName(v.getSkill().getName());

        dto.setCertificateName(v.getCertificateName());
        dto.setCertificateUrl(v.getCertificateUrl());

        dto.setProjectTitle(v.getProjectTitle());
        dto.setProjectDescription(v.getProjectDescription());
        dto.setProjectTechnologies(v.getProjectTechnologies());
        dto.setProjectLink(v.getProjectLink());
        dto.setProjectProofUrl(v.getProjectProofUrl());

        dto.setExperienceTitle(v.getExperienceTitle());
        dto.setExperienceOrganization(v.getExperienceOrganization());
        dto.setExperienceDescription(v.getExperienceDescription());
        dto.setExperienceDuration(v.getExperienceDuration());
        dto.setExperienceStartDate(v.getExperienceStartDate());
        dto.setExperienceEndDate(v.getExperienceEndDate());

        dto.setStatus(v.getStatus());
        dto.setAdminComment(v.getAdminComment());
        dto.setSubmissionDate(v.getSubmissionDate());
        dto.setReviewedDate(v.getReviewedDate());
        return dto;
    }
}
