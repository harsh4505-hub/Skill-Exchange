package com.skillexchange.controller;

import com.skillexchange.entity.User;
import com.skillexchange.service.OfflineExchangeProgressService;
import com.skillexchange.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offline-exchanges")
public class OfflineExchangeProgressController {

    private final OfflineExchangeProgressService progressService;
    private final UserService userService;

    public OfflineExchangeProgressController(OfflineExchangeProgressService progressService, UserService userService) {
        this.progressService = progressService;
        this.userService = userService;
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) return null;
        return userService.findByEmail(principal.getName()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getOfflineExchangesForAdmin(Principal principal) {
        User admin = getAuthenticatedUser(principal);
        List<Map<String, Object>> list = progressService.getAllOfflineExchangesForAdmin(admin);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", list);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getAdminOfflineMetrics(Principal principal) {
        User admin = getAuthenticatedUser(principal);
        Map<String, Object> metrics = progressService.getAdminOfflineMetrics(admin);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", metrics);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOfflineExchangeDetail(@PathVariable Long id, Principal principal) {
        User user = getAuthenticatedUser(principal);
        Map<String, Object> details = progressService.getProgressForParticipant(id, user);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", details);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/updates")
    public ResponseEntity<Map<String, Object>> addProgressUpdate(@PathVariable Long id,
                                                                 @RequestBody Map<String, Object> payload,
                                                                 Principal principal) {
        User user = getAuthenticatedUser(principal);
        Map<String, Object> updated = progressService.addProgressUpdate(id, user, payload);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", updated);
        res.put("message", "Offline learning session progress successfully recorded.");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/by-request/{requestId}")
    public ResponseEntity<Map<String, Object>> getByRequestId(@PathVariable Long requestId, Principal principal) {
        User user = getAuthenticatedUser(principal);
        Map<String, Object> details = progressService.getProgressByRequestId(requestId, user);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", details);
        return ResponseEntity.ok(res);
    }
}
