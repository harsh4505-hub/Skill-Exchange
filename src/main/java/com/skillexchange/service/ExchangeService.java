package com.skillexchange.service;

import com.skillexchange.dto.ExchangeDto;
import com.skillexchange.entity.Exchange;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.repository.ExchangeRepository;
import com.skillexchange.repository.RatingReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ExchangeService manages active and historical skill exchange contracts.
 */
@Service
public class ExchangeService {

    @Autowired
    private ExchangeRepository exchangeRepository;

    @Autowired
    private RatingReviewRepository reviewRepository;

    public List<ExchangeDto> getUserExchanges(Long userId, String status) {
        List<Exchange> list;
        if (status != null && !status.trim().isEmpty()) {
            list = exchangeRepository.findAllByUserIdAndStatus(userId, status.trim().toUpperCase());
        } else {
            list = exchangeRepository.findAllByUserId(userId);
        }
        return list.stream()
                .map(e -> mapToDto(e, userId))
                .collect(Collectors.toList());
    }

    public ExchangeDto getExchangeById(Long id, Long currentUserId) {
        Exchange exchange = exchangeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exchange not found: " + id));
        return mapToDto(exchange, currentUserId);
    }

    public ExchangeDto mapToDto(Exchange e, Long currentUserId) {
        ExchangeDto dto = new ExchangeDto();
        dto.setId(e.getId());
        dto.setRequestId(e.getRequest().getId());
        dto.setStudent1Id(e.getStudent1().getId());
        dto.setStudent1Name(e.getStudent1().getStudentProfile() != null ? e.getStudent1().getStudentProfile().getFullName() : e.getStudent1().getEmail());

        dto.setStudent2Id(e.getStudent2().getId());
        dto.setStudent2Name(e.getStudent2().getStudentProfile() != null ? e.getStudent2().getStudentProfile().getFullName() : e.getStudent2().getEmail());

        dto.setSkill1Id(e.getSkill1().getId());
        dto.setSkill1Name(e.getSkill1().getName());

        dto.setSkill2Id(e.getSkill2().getId());
        dto.setSkill2Name(e.getSkill2().getName());

        dto.setLearningMode(e.getLearningMode());
        dto.setStatus(e.getStatus());
        dto.setStartDate(e.getStartDate());
        dto.setCompletionDate(e.getCompletionDate());

        if (currentUserId != null) {
            dto.setReviewedByCurrentStudent(reviewRepository.existsByExchangeIdAndReviewerId(e.getId(), currentUserId));
        }

        return dto;
    }
}
