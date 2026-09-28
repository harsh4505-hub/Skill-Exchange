package com.skillexchange.controller;

import com.skillexchange.dto.ApiResponse;
import com.skillexchange.dto.ExchangeDto;
import com.skillexchange.dto.ExchangeRequestDto;
import com.skillexchange.service.AuthService;
import com.skillexchange.service.ExchangeRequestService;
import com.skillexchange.service.ExchangeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for exchange proposals, acceptance, rejection, and history.
 */
@RestController
@RequestMapping("/api/exchange-requests")
public class ExchangeRequestController {

    @Autowired
    private ExchangeRequestService requestService;

    @Autowired
    private ExchangeService exchangeService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<ApiResponse<ExchangeRequestDto>> sendRequest(@Valid @RequestBody ExchangeRequestDto dto) {
        Long currentUserId = authService.getCurrentUserId();
        ExchangeRequestDto created = requestService.sendRequest(currentUserId, dto);
        return ResponseEntity.ok(ApiResponse.ok("Exchange request sent successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExchangeRequestDto>>> getMyRequests() {
        Long currentUserId = authService.getCurrentUserId();
        List<ExchangeRequestDto> requests = requestService.getRequestsForUser(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Requests retrieved", requests));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ExchangeRequestDto>>> getIncomingPendingRequests() {
        Long currentUserId = authService.getCurrentUserId();
        List<ExchangeRequestDto> requests = requestService.getIncomingPendingRequests(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Incoming pending requests", requests));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<ExchangeRequestDto>> acceptRequest(@PathVariable Long id) {
        Long currentUserId = authService.getCurrentUserId();
        ExchangeRequestDto accepted = requestService.acceptRequest(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Exchange request accepted!", accepted));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ExchangeRequestDto>> rejectRequest(@PathVariable Long id) {
        Long currentUserId = authService.getCurrentUserId();
        ExchangeRequestDto rejected = requestService.rejectRequest(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Exchange request rejected", rejected));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<ExchangeRequestDto>> completeExchange(@PathVariable Long id) {
        Long currentUserId = authService.getCurrentUserId();
        ExchangeRequestDto completed = requestService.completeExchange(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Exchange marked as completed!", completed));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getRequestDetails(@PathVariable Long id) {
        Long currentUserId = authService.getCurrentUserId();
        java.util.Map<String, Object> details = requestService.getRequestDetails(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Exchange request details retrieved", details));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<ExchangeDto>>> getExchangeHistory(@RequestParam(required = false) String status) {
        Long currentUserId = authService.getCurrentUserId();
        List<ExchangeDto> exchanges = exchangeService.getUserExchanges(currentUserId, status);
        return ResponseEntity.ok(ApiResponse.ok("Exchange history retrieved", exchanges));
    }
}
