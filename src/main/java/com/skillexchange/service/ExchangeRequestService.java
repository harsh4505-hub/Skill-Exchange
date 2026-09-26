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
}
