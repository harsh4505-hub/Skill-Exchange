package com.skillexchange.service;

import com.skillexchange.entity.*;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.repository.ChatMessageRepository;
import com.skillexchange.repository.ExchangeRequestRepository;
import com.skillexchange.repository.NotificationRepository;
import com.skillexchange.repository.OnlineSessionRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class OnlineSessionService {

    private final OnlineSessionRepository onlineSessionRepository;
    private final ExchangeRequestRepository exchangeRequestRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final NotificationRepository notificationRepository;
    private final ZoomService zoomService;

    public OnlineSessionService(OnlineSessionRepository onlineSessionRepository,
                                ExchangeRequestRepository exchangeRequestRepository,
                                ChatMessageRepository chatMessageRepository,
                                NotificationRepository notificationRepository,
                                ZoomService zoomService) {
        this.onlineSessionRepository = onlineSessionRepository;
        this.exchangeRequestRepository = exchangeRequestRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.notificationRepository = notificationRepository;
        this.zoomService = zoomService;
    }

    @Transactional
    public OnlineSession scheduleOnlineSession(User currentUser, Long exchangeRequestId, String title,
                                               String scheduledDate, String scheduledTime,
                                               Integer durationMinutes, String description) {
        if (currentUser == null) {
            throw new AccessDeniedException("Authentication required.");
        }

        ExchangeRequest request = exchangeRequestRepository.findById(exchangeRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Exchange request not found: " + exchangeRequestId));

        if (!"ACCEPTED".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalArgumentException("Online sessions can only be scheduled for accepted skill exchanges.");
        }

        if (!"ONLINE".equalsIgnoreCase(request.getLearningMode())) {
            throw new IllegalArgumentException("This skill exchange is not conducted in Online mode.");
        }

        Long uid = currentUser.getId();
        boolean isSender = uid.equals(request.getSender().getId());
        boolean isReceiver = uid.equals(request.getReceiver().getId());

        if (!isSender && !isReceiver && !"ROLE_ADMIN".equals(currentUser.getRole())) {
            throw new AccessDeniedException("You are not an authorized participant of this skill exchange.");
        }

        User teacher = request.getSender();
        User learner = request.getReceiver();
        String skillName = request.getSkillOffered() != null ? request.getSkillOffered().getName() : "Skill Exchange";

        int duration = (durationMinutes != null && durationMinutes > 0) ? durationMinutes : 60;
        String topic = (title != null && !title.trim().isEmpty()) ? title.trim() : ("Online Session: " + skillName);

        // Call Zoom integration
        ZoomService.ZoomMeetingDetails zoom = zoomService.createMeeting(
                topic,
                scheduledDate + "T" + scheduledTime + ":00Z",
                duration,
                description
        );

        OnlineSession session = new OnlineSession(
                request,
                teacher,
                learner,
                skillName,
                topic,
                description,
                scheduledDate,
                scheduledTime,
                duration,
                zoom.getMeetingId(),
                zoom.getJoinUrl(),
                zoom.getPassword()
        );

        OnlineSession saved = onlineSessionRepository.save(session);

        // Section 8 requirement: When session is created, auto-add a system message to exchange conversation
        User partner = isSender ? learner : teacher;
        String autoSysMessage = String.format("Online session scheduled for %s at %s.", scheduledDate, scheduledTime);
        ChatMessage sysMsg = new ChatMessage(currentUser, partner, autoSysMessage);
        sysMsg.setStatus("DELIVERED");
        chatMessageRepository.save(sysMsg);

        // Notification
        Notification notif = new Notification(
                partner,
                "Online Session Scheduled",
                String.format("%s scheduled an online session for %s on %s at %s.",
                        currentUser.getEmail(), skillName, scheduledDate, scheduledTime),
                "ONLINE_SESSION_SCHEDULED"
        );
        notif.setLinkUrl("requests.html");
        notificationRepository.save(notif);

        return saved;
    }

    public OnlineSession getSessionById(Long sessionId, User currentUser) {
        OnlineSession session = onlineSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Online session not found: " + sessionId));

        if (currentUser != null && !"ROLE_ADMIN".equals(currentUser.getRole())) {
            Long uid = currentUser.getId();
            boolean isTeacher = session.getTeacher() != null && uid.equals(session.getTeacher().getId());
            boolean isLearner = session.getLearner() != null && uid.equals(session.getLearner().getId());
            if (!isTeacher && !isLearner) {
                throw new AccessDeniedException("Access denied: You are not authorized to view this session.");
            }
        }
        return session;
    }

    public Optional<OnlineSession> getSessionForExchangeRequest(Long requestId, User currentUser) {
        Optional<OnlineSession> opt = onlineSessionRepository.findByExchangeRequestId(requestId);
        if (opt.isPresent() && currentUser != null && !"ROLE_ADMIN".equals(currentUser.getRole())) {
            OnlineSession session = opt.get();
            Long uid = currentUser.getId();
            boolean isTeacher = session.getTeacher() != null && uid.equals(session.getTeacher().getId());
            boolean isLearner = session.getLearner() != null && uid.equals(session.getLearner().getId());
            if (!isTeacher && !isLearner) {
                throw new AccessDeniedException("Access denied to online session details.");
            }
        }
        return opt;
    }

    public List<OnlineSession> getSessionsForUser(User currentUser) {
        if (currentUser == null) return Collections.emptyList();
        if ("ROLE_ADMIN".equals(currentUser.getRole())) {
            return onlineSessionRepository.findAll();
        }
        return onlineSessionRepository.findByTeacherIdOrLearnerId(currentUser.getId(), currentUser.getId());
    }

    @Transactional
    public OnlineSession updateSessionStatus(Long sessionId, String status, User currentUser) {
        OnlineSession session = getSessionById(sessionId, currentUser);
        if ("Live".equalsIgnoreCase(status) || "Completed".equalsIgnoreCase(status) || "Scheduled".equalsIgnoreCase(status)) {
            session.setStatus(status);
            session.setUpdatedAt(LocalDateTime.now());
            return onlineSessionRepository.save(session);
        }
        throw new IllegalArgumentException("Invalid session status: " + status);
    }
}
