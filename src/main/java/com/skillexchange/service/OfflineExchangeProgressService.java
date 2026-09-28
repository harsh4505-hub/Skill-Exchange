package com.skillexchange.service;

import com.skillexchange.entity.*;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.exception.UnauthorizedException;
import com.skillexchange.repository.OfflineExchangeProgressRepository;
import com.skillexchange.repository.OfflineProgressUpdateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional
public class OfflineExchangeProgressService {

    private final OfflineExchangeProgressRepository progressRepository;
    private final OfflineProgressUpdateRepository updateRepository;

    public OfflineExchangeProgressService(OfflineExchangeProgressRepository progressRepository,
                                          OfflineProgressUpdateRepository updateRepository) {
        this.progressRepository = progressRepository;
        this.updateRepository = updateRepository;
    }

    public OfflineExchangeProgress initializeOfflineProgress(ExchangeRequest request, Exchange exchange, String location) {
        if (request == null || !"OFFLINE".equalsIgnoreCase(request.getLearningMode())) {
            return null;
        }

        Optional<OfflineExchangeProgress> existing = progressRepository.findByExchangeRequestId(request.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        OfflineExchangeProgress progress = new OfflineExchangeProgress(
                request,
                exchange,
                request.getSender(),
                request.getReceiver(),
                request.getSkillOffered(),
                request.getSkillRequested(),
                location
        );
        OfflineExchangeProgress saved = progressRepository.save(progress);

        // Record initial milestone in progress updates
        OfflineProgressUpdate initialUpdate = new OfflineProgressUpdate(
                saved,
                request.getReceiver(),
                LocalDate.now(),
                "Exchange Accepted",
                "Proposal accepted and offline learning track initialized.",
                "Handover and offline curriculum established for campus peer sessions.",
                10,
                "Schedule first offline session at " + saved.getLocation(),
                null
        );
        updateRepository.save(initialUpdate);

        return saved;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProgressForParticipant(Long progressId, User currentUser) {
        OfflineExchangeProgress progress = progressRepository.findById(progressId)
                .orElseThrow(() -> new ResourceNotFoundException("Offline exchange progress not found with id: " + progressId));

        boolean isParticipant = currentUser != null && (
                progress.getTeacher().getId().equals(currentUser.getId()) ||
                progress.getLearner().getId().equals(currentUser.getId()) ||
                "ROLE_ADMIN".equals(currentUser.getRole())
        );

        if (!isParticipant) {
            throw new UnauthorizedException("You are not authorized to view this offline exchange progress.");
        }

        return buildProgressResponse(progress);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProgressByRequestId(Long requestId, User currentUser) {
        OfflineExchangeProgress progress = progressRepository.findByExchangeRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("No offline progress found for request id: " + requestId));

        boolean isParticipant = currentUser != null && (
                progress.getTeacher().getId().equals(currentUser.getId()) ||
                progress.getLearner().getId().equals(currentUser.getId()) ||
                "ROLE_ADMIN".equals(currentUser.getRole())
        );

        if (!isParticipant) {
            throw new UnauthorizedException("You are not authorized to view this offline exchange progress.");
        }

        return buildProgressResponse(progress);
    }

    public Map<String, Object> addProgressUpdate(Long progressId, User currentUser, Map<String, Object> payload) {
        OfflineExchangeProgress progress = progressRepository.findById(progressId)
                .orElseThrow(() -> new ResourceNotFoundException("Offline exchange progress not found with id: " + progressId));

        boolean isParticipant = currentUser != null && (
                progress.getTeacher().getId().equals(currentUser.getId()) ||
                progress.getLearner().getId().equals(currentUser.getId())
        );

        if (!isParticipant) {
            throw new UnauthorizedException("Only registered participants of this exchange can submit progress updates.");
        }

        int percentage = payload.get("progressPercentage") != null ?
                Integer.parseInt(payload.get("progressPercentage").toString()) : progress.getProgressPercentage();

        if (percentage < 0 || percentage > 100) {
            throw new IllegalArgumentException("Progress percentage must be between 0 and 100.");
        }

        String stage = (String) payload.getOrDefault("stage", progress.getCurrentStage());
        String topicsCovered = (String) payload.get("topicsCovered");
        if (topicsCovered == null || topicsCovered.trim().isEmpty()) {
            throw new IllegalArgumentException("Topics covered is required for an offline session log.");
        }

        String description = (String) payload.getOrDefault("description", "");
        String nextActivity = (String) payload.getOrDefault("nextActivity", "Practice and next module study");
        String attachmentUrl = (String) payload.get("attachmentUrl");

        LocalDate sessionDate = LocalDate.now();
        if (payload.get("sessionDate") != null) {
            try {
                sessionDate = LocalDate.parse(payload.get("sessionDate").toString());
            } catch (Exception ignored) {}
        }

        OfflineProgressUpdate update = new OfflineProgressUpdate(
                progress,
                currentUser,
                sessionDate,
                stage,
                topicsCovered.trim(),
                description != null ? description.trim() : "",
                percentage,
                nextActivity != null ? nextActivity.trim() : "",
                attachmentUrl
        );
        updateRepository.save(update);

        progress.setProgressPercentage(percentage);
        progress.setCurrentStage(stage);
        progress.setNextActivity(nextActivity);
        progress.setLastActivityAt(LocalDateTime.now());
        progress.setUpdatedAt(LocalDateTime.now());

        if (percentage >= 100 || "Exchange Completed".equalsIgnoreCase(stage)) {
            progress.setStatus("COMPLETED");
            progress.setProgressPercentage(100);
            progress.setCurrentStage("Exchange Completed");
            progress.setCompletionDate(LocalDateTime.now());
        } else {
            progress.setStatus("ACTIVE");
        }

        progressRepository.save(progress);

        return buildProgressResponse(progress);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllOfflineExchangesForAdmin(User adminUser) {
        if (adminUser == null || !"ROLE_ADMIN".equals(adminUser.getRole())) {
            throw new UnauthorizedException("Administrator role required to access offline exchange oversight.");
        }

        List<OfflineExchangeProgress> list = progressRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (OfflineExchangeProgress p : list) {
            result.add(buildSummaryMap(p));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOfflineExchangeDetailForAdmin(Long progressId, User adminUser) {
        if (adminUser == null || !"ROLE_ADMIN".equals(adminUser.getRole())) {
            throw new UnauthorizedException("Administrator role required.");
        }

        OfflineExchangeProgress progress = progressRepository.findById(progressId)
                .orElseThrow(() -> new ResourceNotFoundException("Offline progress not found: " + progressId));

        return buildProgressResponse(progress);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdminOfflineMetrics(User adminUser) {
        if (adminUser == null || !"ROLE_ADMIN".equals(adminUser.getRole())) {
            throw new UnauthorizedException("Administrator role required.");
        }

        List<OfflineExchangeProgress> all = progressRepository.findAll();
        long activeCount = 0;
        long completedCount = 0;
        long overdueCount = 0;
        long totalUpdates = updateRepository.count();

        for (OfflineExchangeProgress p : all) {
            boolean isCompleted = "COMPLETED".equalsIgnoreCase(p.getStatus()) || p.getProgressPercentage() >= 100;
            if (isCompleted) {
                completedCount++;
            } else {
                activeCount++;
                if (isOverdue(p)) {
                    overdueCount++;
                }
            }
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalOfflineExchanges", all.size());
        metrics.put("activeOfflineExchanges", activeCount);
        metrics.put("completedOfflineExchanges", completedCount);
        metrics.put("overdueExchanges", overdueCount);
        metrics.put("totalSessionUpdates", totalUpdates);

        return metrics;
    }

    private boolean isOverdue(OfflineExchangeProgress p) {
        if ("COMPLETED".equalsIgnoreCase(p.getStatus()) || p.getProgressPercentage() >= 100) {
            return false;
        }
        LocalDateTime last = p.getLastActivityAt() != null ? p.getLastActivityAt() : p.getStartDate();
        return ChronoUnit.DAYS.between(last, LocalDateTime.now()) >= 7;
    }

    private Map<String, Object> buildSummaryMap(OfflineExchangeProgress p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("exchangeRequestId", p.getExchangeRequest() != null ? p.getExchangeRequest().getId() : null);
        map.put("exchangeId", p.getExchange() != null ? p.getExchange().getId() : null);
        map.put("teacherId", p.getTeacher().getId());
        map.put("teacherName", p.getTeacher().getEmail()); // Or profile name
        map.put("learnerId", p.getLearner().getId());
        map.put("learnerName", p.getLearner().getEmail());
        map.put("skillOfferedTitle", p.getSkillOffered().getTitle());
        map.put("skillRequestedTitle", p.getSkillRequested().getTitle());
        map.put("location", p.getLocation());
        map.put("progressPercentage", p.getProgressPercentage());
        map.put("currentStage", p.getCurrentStage());
        map.put("startDate", p.getStartDate());
        map.put("expectedCompletionDate", p.getExpectedCompletionDate());
        map.put("lastActivityAt", p.getLastActivityAt());
        map.put("nextActivity", p.getNextActivity());

        boolean overdue = isOverdue(p);
        map.put("isOverdue", overdue);
        map.put("status", overdue ? "NEEDS_ATTENTION" : p.getStatus());
        map.put("statusLabel", overdue ? "Progress update overdue" : p.getStatus());

        return map;
    }

    private Map<String, Object> buildProgressResponse(OfflineExchangeProgress p) {
        Map<String, Object> res = buildSummaryMap(p);

        List<OfflineProgressUpdate> updates = updateRepository.findByOfflineExchangeProgressIdOrderByCreatedAtDesc(p.getId());
        List<Map<String, Object>> updateList = new ArrayList<>();

        for (OfflineProgressUpdate u : updates) {
            Map<String, Object> uMap = new HashMap<>();
            uMap.put("id", u.getId());
            uMap.put("submittedById", u.getSubmittedBy().getId());
            uMap.put("submittedByName", u.getSubmittedBy().getEmail());
            uMap.put("sessionDate", u.getSessionDate());
            uMap.put("stage", u.getStage());
            uMap.put("topicsCovered", u.getTopicsCovered());
            uMap.put("description", u.getDescription());
            uMap.put("progressPercentage", u.getProgressPercentage());
            uMap.put("nextActivity", u.getNextActivity());
            uMap.put("attachmentUrl", u.getAttachmentUrl());
            uMap.put("createdAt", u.getCreatedAt());
            updateList.add(uMap);
        }

        res.put("updates", updateList);
        return res;
    }
}
