package com.skillexchange.controller;

import com.skillexchange.entity.OnlineSession;
import com.skillexchange.entity.User;
import com.skillexchange.service.OnlineSessionService;
import com.skillexchange.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/online-sessions")
public class OnlineSessionController {

    private final OnlineSessionService sessionService;
    private final UserService userService;

    public OnlineSessionController(OnlineSessionService sessionService, UserService userService) {
        this.sessionService = sessionService;
        this.userService = userService;
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) return null;
        return userService.findByEmail(principal.getName()).orElse(null);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> scheduleOnlineSession(@RequestBody Map<String, Object> payload, Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        Long reqId = Long.valueOf(payload.get("exchangeRequestId").toString());
        String title = (String) payload.get("title");
        String scheduledDate = (String) payload.get("scheduledDate");
        String scheduledTime = (String) payload.get("scheduledTime");
        Integer duration = payload.get("durationMinutes") != null ? Integer.valueOf(payload.get("durationMinutes").toString()) : 60;
        String desc = (String) payload.get("description");

        OnlineSession session = sessionService.scheduleOnlineSession(currentUser, reqId, title, scheduledDate, scheduledTime, duration, desc);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", session);
        res.put("message", "Online skill session scheduled successfully.");
        return ResponseEntity.ok(res);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getOnlineSessions(Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        List<OnlineSession> sessions = sessionService.getSessionsForUser(currentUser);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", sessions);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOnlineSession(@PathVariable Long id, Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        OnlineSession session = sessionService.getSessionById(id, currentUser);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", session);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateSessionStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        String status = body.get("status");
        OnlineSession updated = sessionService.updateSessionStatus(id, status, currentUser);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", updated);
        res.put("message", "Session status updated to " + status);
        return ResponseEntity.ok(res);
    }
}
