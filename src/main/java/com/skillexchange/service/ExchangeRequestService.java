package com.skillexchange.service;

import com.skillexchange.dto.ExchangeRequestDto;
import com.skillexchange.entity.*;
import com.skillexchange.exception.BadRequestException;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.exception.UnauthorizedException;
import com.skillexchange.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ExchangeRequestService manages skill barter requests lifecycle:
 * creation, peer acceptance, rejection, and final mutual completion.
 */
@Service
public class ExchangeRequestService {

    @Autowired
    private ExchangeRequestRepository requestRepository;

    @Autowired
    private ExchangeRepository exchangeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private BlockedUserRepository blockedUserRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SkillVerificationRepository skillVerificationRepository;

    @Autowired
    private StudentProfileService studentProfileService;

    @Transactional
    public ExchangeRequestDto sendRequest(Long senderId, ExchangeRequestDto dto) {
        if (senderId.equals(dto.getReceiverId())) {
            throw new BadRequestException("You cannot send an exchange request to yourself");
        }

        if (blockedUserRepository.existsByBlockerIdAndBlockedId(dto.getReceiverId(), senderId) ||
            blockedUserRepository.existsByBlockerIdAndBlockedId(senderId, dto.getReceiverId())) {
            throw new BadRequestException("Cannot communicate with this student due to blocking settings");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender user not found: " + senderId));
        User receiver = userRepository.findById(dto.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver user not found: " + dto.getReceiverId()));

        Skill skillOffered = skillRepository.findById(dto.getSkillOfferedId())
                .orElseThrow(() -> new ResourceNotFoundException("Offered skill not found: " + dto.getSkillOfferedId()));
        Skill skillRequested = skillRepository.findById(dto.getSkillRequestedId())
                .orElseThrow(() -> new ResourceNotFoundException("Requested skill not found: " + dto.getSkillRequestedId()));

        ExchangeRequest request = new ExchangeRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setSkillOffered(skillOffered);
        request.setSkillRequested(skillRequested);
        request.setMessage(dto.getMessage());
        request.setLearningMode(dto.getLearningMode() != null ? dto.getLearningMode().toUpperCase() : "ONLINE");
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());

        ExchangeRequest saved = requestRepository.save(request);

        String senderName = sender.getStudentProfile() != null ? sender.getStudentProfile().getFullName() : sender.getEmail();
        notificationService.createNotification(
                receiver,
                "New Skill Exchange Proposal",
                senderName + " proposed an exchange: Offering '" + skillOffered.getName() + "' for your '" + skillRequested.getName() + "'.",
                "EXCHANGE_REQUEST",
                saved.getId()
        );

        return mapToDto(saved);
    }

    public List<ExchangeRequestDto> getRequestsForUser(Long userId) {
        return requestRepository.findAllByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ExchangeRequestDto> getIncomingPendingRequests(Long userId) {
        return requestRepository.findByReceiverIdAndStatusOrderByCreatedAtDesc(userId, "PENDING").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExchangeRequestDto acceptRequest(Long requestId, Long currentUserId) {
        ExchangeRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Exchange request not found: " + requestId));

        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only the recipient can accept this exchange request");
        }

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("Request is already " + request.getStatus());
        }

        request.setStatus("ACCEPTED");
        request.setUpdatedAt(LocalDateTime.now());
        ExchangeRequest savedRequest = requestRepository.save(request);

        // Instantiate active Exchange contract
        Exchange exchange = new Exchange();
        exchange.setRequest(savedRequest);
        exchange.setStudent1(savedRequest.getSender());
        exchange.setStudent2(savedRequest.getReceiver());
        exchange.setSkill1(savedRequest.getSkillOffered());
        exchange.setSkill2(savedRequest.getSkillRequested());
        exchange.setLearningMode(savedRequest.getLearningMode());
        exchange.setStatus("ACTIVE");
        exchange.setStartDate(LocalDateTime.now());
        exchangeRepository.save(exchange);

        String receiverName = savedRequest.getReceiver().getStudentProfile() != null ?
                savedRequest.getReceiver().getStudentProfile().getFullName() : savedRequest.getReceiver().getEmail();

        notificationService.createNotification(
                savedRequest.getSender(),
                "Skill Exchange Accepted!",
                receiverName + " accepted your exchange request! You can now start chatting and coordinating sessions.",
                "REQUEST_ACCEPTED",
                savedRequest.getId()
        );

        return mapToDto(savedRequest);
    }

    @Transactional
    public ExchangeRequestDto rejectRequest(Long requestId, Long currentUserId) {
        ExchangeRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Exchange request not found: " + requestId));

        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only the recipient can reject this exchange request");
        }

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new BadRequestException("Request is already " + request.getStatus());
        }

        request.setStatus("REJECTED");
        request.setUpdatedAt(LocalDateTime.now());
        ExchangeRequest saved = requestRepository.save(request);

        String receiverName = request.getReceiver().getStudentProfile() != null ?
                request.getReceiver().getStudentProfile().getFullName() : request.getReceiver().getEmail();

        notificationService.createNotification(
                request.getSender(),
                "Skill Exchange Declined",
                receiverName + " declined your skill exchange proposal.",
                "REQUEST_REJECTED",
                saved.getId()
        );

        return mapToDto(saved);
    }

    @Transactional
    public ExchangeRequestDto completeExchange(Long requestId, Long currentUserId) {
        ExchangeRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Exchange request not found: " + requestId));

        boolean isParticipant = request.getSender().getId().equals(currentUserId) ||
                               request.getReceiver().getId().equals(currentUserId);
        if (!isParticipant) {
            throw new UnauthorizedException("You are not a participant in this exchange");
        }

        request.setStatus("COMPLETED");
        request.setUpdatedAt(LocalDateTime.now());
        ExchangeRequest savedRequest = requestRepository.save(request);

        // Update corresponding exchange contract
        List<Exchange> exchanges = exchangeRepository.findAllByUserId(currentUserId);
        for (Exchange ex : exchanges) {
            if (ex.getRequest().getId().equals(requestId)) {
                ex.setStatus("COMPLETED");
                ex.setCompletionDate(LocalDateTime.now());
                exchangeRepository.save(ex);
                break;
            }
        }

        // Increment completed counters on both profiles
        StudentProfile p1 = profileRepository.findByUserId(request.getSender().getId()).orElse(null);
        if (p1 != null) {
            p1.setCompletedExchangesCount(p1.getCompletedExchangesCount() + 1);
            profileRepository.save(p1);
        }

        StudentProfile p2 = profileRepository.findByUserId(request.getReceiver().getId()).orElse(null);
        if (p2 != null) {
            p2.setCompletedExchangesCount(p2.getCompletedExchangesCount() + 1);
            profileRepository.save(p2);
        }

        // Notify peer
        User otherUser = request.getSender().getId().equals(currentUserId) ? request.getReceiver() : request.getSender();
        notificationService.createNotification(
                otherUser,
                "Skill Exchange Completed!",
                "Your skill exchange has been marked as completed! Please take a moment to rate and review your peer.",
                "EXCHANGE_COMPLETED",
                savedRequest.getId()
        );

        return mapToDto(savedRequest);
    }

    public ExchangeRequestDto mapToDto(ExchangeRequest req) {
        ExchangeRequestDto dto = new ExchangeRequestDto();
        dto.setId(req.getId());
        dto.setSenderId(req.getSender().getId());
        dto.setSenderName(req.getSender().getStudentProfile() != null ? req.getSender().getStudentProfile().getFullName() : req.getSender().getEmail());
        dto.setSenderEmail(req.getSender().getEmail());

        dto.setReceiverId(req.getReceiver().getId());
        dto.setReceiverName(req.getReceiver().getStudentProfile() != null ? req.getReceiver().getStudentProfile().getFullName() : req.getReceiver().getEmail());

        dto.setSkillOfferedId(req.getSkillOffered().getId());
        dto.setSkillOfferedName(req.getSkillOffered().getName());

        dto.setSkillRequestedId(req.getSkillRequested().getId());
        dto.setSkillRequestedName(req.getSkillRequested().getName());

        dto.setMessage(req.getMessage());
        dto.setLearningMode(req.getLearningMode());
        dto.setStatus(req.getStatus());
        dto.setCreatedAt(req.getCreatedAt());
        return dto;
    }

    public java.util.Map<String, Object> getRequestDetails(Long requestId, Long currentUserId) {
        ExchangeRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Exchange proposal not found: " + requestId));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found: " + currentUserId));

        boolean isAdmin = "ROLE_ADMIN".equals(currentUser.getRole());
        boolean isParticipant = req.getSender().getId().equals(currentUserId) || req.getReceiver().getId().equals(currentUserId);

        if (!isParticipant && !isAdmin) {
            throw new UnauthorizedException("Access Denied: You are not authorized to view the details of this exchange request.");
        }

        java.util.Map<String, Object> senderDetails = buildStudentQualificationDetails(req.getSender().getId(), req.getSkillOffered().getId());
        java.util.Map<String, Object> receiverDetails = buildStudentQualificationDetails(req.getReceiver().getId(), req.getSkillRequested().getId());

        boolean isIncoming = req.getReceiver().getId().equals(currentUserId);
        boolean isSender = req.getSender().getId().equals(currentUserId);

        java.util.Map<String, Object> requestMap = new java.util.HashMap<>();
        requestMap.put("id", req.getId());
        requestMap.put("senderId", req.getSender().getId());
        requestMap.put("senderName", req.getSender().getStudentProfile() != null ? req.getSender().getStudentProfile().getFullName() : req.getSender().getEmail());
        requestMap.put("senderEmail", req.getSender().getEmail());
        requestMap.put("receiverId", req.getReceiver().getId());
        requestMap.put("receiverName", req.getReceiver().getStudentProfile() != null ? req.getReceiver().getStudentProfile().getFullName() : req.getReceiver().getEmail());
        requestMap.put("receiverEmail", req.getReceiver().getEmail());
        requestMap.put("skillOfferedId", req.getSkillOffered().getId());
        requestMap.put("skillOfferedName", req.getSkillOffered().getName());
        requestMap.put("skillRequestedId", req.getSkillRequested().getId());
        requestMap.put("skillRequestedName", req.getSkillRequested().getName());
        requestMap.put("learningMode", req.getLearningMode());
        requestMap.put("message", req.getMessage());
        requestMap.put("status", req.getStatus());
        requestMap.put("createdAt", req.getCreatedAt() != null ? req.getCreatedAt().toString() : java.time.LocalDateTime.now().toString());
        requestMap.put("isIncoming", isIncoming);
        requestMap.put("isSender", isSender);

        java.util.Map<String, Object> offeredSkillDetails = new java.util.HashMap<>();
        offeredSkillDetails.put("skillId", req.getSkillOffered().getId());
        offeredSkillDetails.put("skillName", req.getSkillOffered().getName());
        offeredSkillDetails.put("categoryName", req.getSkillOffered().getCategory() != null ? req.getSkillOffered().getCategory().getName() : "General");
        offeredSkillDetails.put("proficiencyLevel", "Competent");
        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> senderVerSummary = (java.util.Map<String, Object>) senderDetails.get("verification");
        offeredSkillDetails.put("isVerified", senderVerSummary != null && Boolean.TRUE.equals(senderVerSummary.get("offeredSkillVerified")));
        offeredSkillDetails.put("verificationStatus", senderVerSummary != null ? senderVerSummary.get("offeredSkillStatus") : "NOT_VERIFIED");
        offeredSkillDetails.put("adminComment", senderVerSummary != null ? senderVerSummary.get("adminComment") : "");

        java.util.Map<String, Object> requestedSkillDetails = new java.util.HashMap<>();
        requestedSkillDetails.put("skillId", req.getSkillRequested().getId());
        requestedSkillDetails.put("skillName", req.getSkillRequested().getName());
        requestedSkillDetails.put("categoryName", req.getSkillRequested().getCategory() != null ? req.getSkillRequested().getCategory().getName() : "General");
        requestedSkillDetails.put("urgencyLevel", "Standard");

        java.util.Map<String, Object> viewer = new java.util.HashMap<>();
        viewer.put("userId", currentUserId);
        viewer.put("role", currentUser.getRole());
        viewer.put("isParticipant", isParticipant);
        viewer.put("isSender", isSender);
        viewer.put("isIncoming", isIncoming);
        viewer.put("canAcceptOrReject", isIncoming && "PENDING".equals(req.getStatus()));
        viewer.put("canChat", "ACCEPTED".equals(req.getStatus()));
        viewer.put("canComplete", isParticipant && "ACCEPTED".equals(req.getStatus()));
        viewer.put("canRate", isParticipant && "COMPLETED".equals(req.getStatus()));

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("request", requestMap);
        result.put("sender", senderDetails.get("profile"));
        result.put("receiver", receiverDetails.get("profile"));
        result.put("projects", senderDetails.get("projects"));
        result.put("experiences", senderDetails.get("experiences"));
        result.put("certificates", senderDetails.get("certificates"));
        result.put("verification", senderDetails.get("verification"));
        result.put("senderDetails", senderDetails);
        result.put("receiverDetails", receiverDetails);
        result.put("receiverProjects", receiverDetails.get("projects"));
        result.put("receiverExperiences", receiverDetails.get("experiences"));
        result.put("receiverCertificates", receiverDetails.get("certificates"));
        result.put("receiverVerification", receiverDetails.get("verification"));
        result.put("offeredSkillDetails", offeredSkillDetails);
        result.put("requestedSkillDetails", requestedSkillDetails);
        result.put("viewer", viewer);

        return result;
    }

    private java.util.Map<String, Object> buildStudentQualificationDetails(Long userId, Long focusSkillId) {
        com.skillexchange.dto.StudentProfileDto prof = studentProfileService.getProfileDto(userId);
        List<SkillVerification> verifications = skillVerificationRepository.findByStudentIdOrderBySubmissionDateDesc(userId);

        List<java.util.Map<String, Object>> projects = new java.util.ArrayList<>();
        List<java.util.Map<String, Object>> experiences = new java.util.ArrayList<>();
        List<java.util.Map<String, Object>> certificates = new java.util.ArrayList<>();

        SkillVerification focusVer = null;
        for (SkillVerification v : verifications) {
            if (v.getSkill().getId().equals(focusSkillId)) {
                focusVer = v;
                break;
            }
        }

        for (SkillVerification v : verifications) {
            if (v.getProjectTitle() != null && !v.getProjectTitle().trim().isEmpty()) {
                java.util.Map<String, Object> p = new java.util.HashMap<>();
                p.put("id", v.getId());
                p.put("studentId", userId);
                p.put("title", v.getProjectTitle());
                p.put("description", v.getProjectDescription());
                p.put("technologies", v.getProjectTechnologies());
                p.put("link", v.getProjectLink());
                p.put("proofUrl", v.getProjectProofUrl());
                p.put("reviewStatus", v.getStatus());
                p.put("isOfferedSkillProject", v.getSkill().getId().equals(focusSkillId));
                projects.add(p);
            }

            if (v.getExperienceTitle() != null && !v.getExperienceTitle().trim().isEmpty()) {
                java.util.Map<String, Object> e = new java.util.HashMap<>();
                e.put("id", v.getId());
                e.put("studentId", userId);
                e.put("title", v.getExperienceTitle());
                e.put("organization", v.getExperienceOrganization());
                e.put("description", v.getExperienceDescription());
                e.put("duration", v.getExperienceDuration());
                e.put("startDate", v.getExperienceStartDate());
                e.put("endDate", v.getExperienceEndDate());
                e.put("reviewStatus", v.getStatus());
                e.put("isOfferedSkillExperience", v.getSkill().getId().equals(focusSkillId));
                experiences.add(e);
            }

            if (v.getCertificateName() != null || v.getCertificateUrl() != null) {
                java.util.Map<String, Object> c = new java.util.HashMap<>();
                c.put("title", v.getCertificateName() != null ? v.getCertificateName() : v.getSkill().getName() + " Certificate");
                c.put("issuingOrganization", v.getExperienceOrganization() != null ? v.getExperienceOrganization() : "Accredited Certification Authority");
                c.put("skillId", v.getSkill().getId());
                c.put("skillName", v.getSkill().getName());
                c.put("documentUrl", v.getCertificateUrl() != null ? v.getCertificateUrl() : "");
                c.put("verificationStatus", v.getStatus());
                c.put("reviewedDate", v.getReviewedDate() != null ? v.getReviewedDate().toString() : null);
                c.put("isOfferedSkill", v.getSkill().getId().equals(focusSkillId));
                certificates.add(c);
            }
        }

        // Also add any teaching skill proof document as a certificate if not already present
        if (prof != null && prof.getTeachingSkills() != null) {
            for (com.skillexchange.dto.UserSkillDto ts : prof.getTeachingSkills()) {
                if (ts.getProofDocumentUrl() != null && !ts.getProofDocumentUrl().trim().isEmpty()) {
                    boolean alreadyExists = false;
                    for (java.util.Map<String, Object> c : certificates) {
                        if (ts.getProofDocumentUrl().equals(c.get("documentUrl"))) {
                            alreadyExists = true;
                            break;
                        }
                    }
                    if (!alreadyExists) {
                        java.util.Map<String, Object> c = new java.util.HashMap<>();
                        c.put("title", ts.getSkillName() + " Verification Certificate");
                        c.put("issuingOrganization", "Recognized Certification / Academic Review");
                        c.put("skillId", ts.getSkillId());
                        c.put("skillName", ts.getSkillName());
                        c.put("documentUrl", ts.getProofDocumentUrl());
                        c.put("verificationStatus", ts.getVerificationStatus() != null ? ts.getVerificationStatus() : (ts.isVerified() ? "VERIFIED" : "PENDING"));
                        c.put("reviewedDate", null);
                        c.put("isOfferedSkill", ts.getSkillId().equals(focusSkillId));
                        certificates.add(c);
                    }
                }
            }
        }

        java.util.Map<String, Object> verificationSummary = new java.util.HashMap<>();
        verificationSummary.put("isStudentVerified", prof != null && prof.isVerified());
        boolean offeredSkillVerified = false;
        String offeredSkillStatus = "NOT_VERIFIED";
        if (prof != null && prof.getTeachingSkills() != null) {
            for (com.skillexchange.dto.UserSkillDto ts : prof.getTeachingSkills()) {
                if (ts.getSkillId().equals(focusSkillId)) {
                    offeredSkillVerified = ts.isVerified() || "VERIFIED".equals(ts.getVerificationStatus());
                    offeredSkillStatus = ts.getVerificationStatus() != null ? ts.getVerificationStatus() : (ts.isVerified() ? "VERIFIED" : "NOT_VERIFIED");
                    break;
                }
            }
        }
        verificationSummary.put("offeredSkillVerified", offeredSkillVerified);
        verificationSummary.put("offeredSkillStatus", offeredSkillStatus);
        boolean hasRevProjects = false;
        for (java.util.Map<String, Object> p : projects) {
            if ("VERIFIED".equals(p.get("reviewStatus"))) { hasRevProjects = true; break; }
        }
        boolean hasRevExp = false;
        for (java.util.Map<String, Object> e : experiences) {
            if ("VERIFIED".equals(e.get("reviewStatus"))) { hasRevExp = true; break; }
        }
        boolean hasVerCert = false;
        for (java.util.Map<String, Object> c : certificates) {
            if ("VERIFIED".equals(c.get("verificationStatus"))) { hasVerCert = true; break; }
        }
        verificationSummary.put("hasReviewedProjects", hasRevProjects);
        verificationSummary.put("hasReviewedExperience", hasRevExp);
        verificationSummary.put("hasVerifiedCertificate", hasVerCert);
        verificationSummary.put("adminComment", focusVer != null && focusVer.getAdminComment() != null ? focusVer.getAdminComment() : "");

        java.util.Map<String, Object> out = new java.util.HashMap<>();
        out.put("profile", prof);
        out.put("projects", projects);
        out.put("experiences", experiences);
        out.put("certificates", certificates);
        out.put("verification", verificationSummary);
        return out;
    }
}
