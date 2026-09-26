package com.skillexchange.service;

import com.skillexchange.dto.ReportDto;
import com.skillexchange.entity.*;
import com.skillexchange.exception.BadRequestException;
import com.skillexchange.exception.DuplicateResourceException;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ReportBlockService handles incident reporting for community safety
 * and peer-level contact blocking.
 */
@Service
public class ReportBlockService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private BlockedUserRepository blockedUserRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ReportDto reportUser(Long reporterId, ReportDto dto) {
        if (reporterId.equals(dto.getReportedUserId())) {
            throw new BadRequestException("You cannot report yourself");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found: " + reporterId));
        User reported = userRepository.findById(dto.getReportedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Reported user not found: " + dto.getReportedUserId()));

        Report report = new Report();
        report.setReporter(reporter);
        report.setReportedUser(reported);
        report.setReason(dto.getReason());
        report.setDescription(dto.getDescription());
        report.setStatus("PENDING");
        report.setCreatedAt(LocalDateTime.now());

        Report saved = reportRepository.save(report);
        return mapToDto(saved);
    }

    @Transactional
    public void blockUser(Long blockerId, Long blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new BadRequestException("You cannot block yourself");
        }

        if (blockedUserRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            throw new DuplicateResourceException("User is already blocked");
        }

        User blocker = userRepository.findById(blockerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + blockerId));
        User blocked = userRepository.findById(blockedId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found: " + blockedId));

        BlockedUser record = new BlockedUser(blocker, blocked);
        blockedUserRepository.save(record);
    }

    @Transactional
    public void unblockUser(Long blockerId, Long blockedId) {
        blockedUserRepository.findByBlockerIdAndBlockedId(blockerId, blockedId)
                .ifPresent(blockedUserRepository::delete);
    }

    public List<ReportDto> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReportDto updateReportStatus(Long reportId, String status, String adminNotes) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));
        report.setStatus(status.toUpperCase());
        report.setAdminNotes(adminNotes);
        return mapToDto(reportRepository.save(report));
    }

    private ReportDto mapToDto(Report r) {
        ReportDto dto = new ReportDto();
        dto.setId(r.getId());
        dto.setReporterId(r.getReporter().getId());
        dto.setReporterName(r.getReporter().getStudentProfile() != null ? r.getReporter().getStudentProfile().getFullName() : r.getReporter().getEmail());
        dto.setReportedUserId(r.getReportedUser().getId());
        dto.setReportedUserName(r.getReportedUser().getStudentProfile() != null ? r.getReportedUser().getStudentProfile().getFullName() : r.getReportedUser().getEmail());
        dto.setReason(r.getReason());
        dto.setDescription(r.getDescription());
        dto.setStatus(r.getStatus());
        dto.setAdminNotes(r.getAdminNotes());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
