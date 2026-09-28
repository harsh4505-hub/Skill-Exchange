package com.skillexchange.controller;

import com.skillexchange.entity.ExchangeNote;
import com.skillexchange.entity.User;
import com.skillexchange.service.ExchangeNoteService;
import com.skillexchange.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exchange-notes")
public class ExchangeNoteController {

    private final ExchangeNoteService noteService;
    private final UserService userService;

    public ExchangeNoteController(ExchangeNoteService noteService, UserService userService) {
        this.noteService = noteService;
        this.userService = userService;
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) return null;
        return userService.findByEmail(principal.getName()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotes(@RequestParam(required = false) Long partnerId, Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        List<ExchangeNote> notes = noteService.getNotes(currentUser, partnerId);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", notes);
        return ResponseEntity.ok(res);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createNote(@RequestBody Map<String, Object> body, Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        Long partnerId = body.get("partnerId") != null ? Long.valueOf(body.get("partnerId").toString()) : null;
        Long reqId = body.get("exchangeRequestId") != null ? Long.valueOf(body.get("exchangeRequestId").toString()) : null;
        String topic = (String) body.get("topic");
        String content = (String) body.get("content");

        ExchangeNote note = noteService.createNote(currentUser, partnerId, reqId, topic, content);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", note);
        res.put("message", "Note saved successfully.");
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateNote(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        String topic = body.get("topic");
        String content = body.get("content");
        ExchangeNote updated = noteService.updateNote(id, topic, content, currentUser);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", updated);
        res.put("message", "Note updated.");
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteNote(@PathVariable Long id, Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        noteService.deleteNote(id, currentUser);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Note deleted successfully.");
        return ResponseEntity.ok(res);
    }
}
