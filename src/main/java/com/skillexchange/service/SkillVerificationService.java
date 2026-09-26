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
 * administrator approval workflows, and badge awarding.
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

        if (verificationRepository.existsByStudentIdAndSkillIdAndStatus(studentId, dto.getSkillId(), "PENDING")) {
            throw new BadRequestException("A verification request for this skill is already pending review");
        }

        SkillVerification verification = new SkillVerification();
        verification.setStudent(student);
        verification.setSkill(skill);
        verification.setDocumentName(dto.getDocumentName().trim());
        verification.setDocumentPath(dto.getDocumentPath() != null ? dto.getDocumentPath().trim() : "uploads/documents/proof.pdf");
        verification.setDescription(dto.getDescription());
        verification.setStatus("PENDING");
        verification.setSubmissionDate(LocalDateTime.now());

        SkillVerification saved = verificationRepository.save(verification);
        return mapToDto(saved);
    }

    public List<SkillVerificationDto> getStudentVerifications(Long studentId) {
        return verificationRepository.findByStudentIdOrderBySubmissionDateDesc(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
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
        verification.setAdminComment(adminComment != null ? adminComment : "Verified by Admin: valid credentials demonstrated.");
        verification.setReviewedDate(LocalDateTime.now());
        SkillVerification saved = verificationRepository.save(verification);

        // Mark skill as verified in UserTeachingSkill
        teachingSkillRepository.findByUserIdAndSkillId(verification.getStudent().getId(), verification.getSkill().getId())
                .ifPresent(ts -> {
                    ts.setVerified(true);
                    ts.setProofDocumentUrl(saved.getDocumentPath());
                    ts.setVerificationNotes("Approved by Admin on " + LocalDateTime.now());
                    teachingSkillRepository.save(ts);
                });

        // Award overall verified badge to student profile
        profileRepository.findByUserId(verification.getStudent().getId()).ifPresent(p -> {
            p.setVerified(true);
            profileRepository.save(p);
        });

        // Notify student
        notificationService.createNotification(
                verification.getStudent(),
                "Skill Verification Approved! ✓",
                "Congratulations! Your proof for '" + verification.getSkill().getName() + "' was verified. You now display a Verified Skill badge!",
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
        verification.setAdminComment(adminComment != null ? adminComment : "Verification rejected. Please re-submit clear documentation.");
        verification.setReviewedDate(LocalDateTime.now());
        SkillVerification saved = verificationRepository.save(verification);

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

    private SkillVerificationDto mapToDto(SkillVerification v) {
        SkillVerificationDto dto = new SkillVerificationDto();
        dto.setId(v.getId());
        dto.setStudentId(v.getStudent().getId());
        dto.setStudentName(v.getStudent().getStudentProfile() != null ? v.getStudent().getStudentProfile().getFullName() : v.getStudent().getEmail());
        dto.setStudentEmail(v.getStudent().getEmail());
        dto.setSkillId(v.getSkill().getId());
        dto.setSkillName(v.getSkill().getName());
        dto.setDocumentName(v.getDocumentName());
        dto.setDocumentPath(v.getDocumentPath());
        dto.setDescription(v.getDescription());
        dto.setStatus(v.getStatus());
        dto.setAdminComment(v.getAdminComment());
        dto.setSubmissionDate(v.getSubmissionDate());
        dto.setReviewedDate(v.getReviewedDate());
        return dto;
    }
}
