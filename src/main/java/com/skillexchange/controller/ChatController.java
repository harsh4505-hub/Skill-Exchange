package com.skillexchange.controller;

import com.skillexchange.dto.ApiResponse;
import com.skillexchange.dto.ChatMessageDto;
import com.skillexchange.dto.StudentProfileDto;
import com.skillexchange.service.AuthService;
import com.skillexchange.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for student peer chat and messaging dialogues.
 */
@RestController
@RequestMapping("/api/messages")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private AuthService authService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<ChatMessageDto>>> getConversation(@PathVariable Long userId) {
        Long currentUserId = authService.getCurrentUserId();
        List<ChatMessageDto> messages = chatService.getConversation(currentUserId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Messages retrieved", messages));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChatMessageDto>> sendMessage(@Valid @RequestBody ChatMessageDto dto) {
        Long currentUserId = authService.getCurrentUserId();
        ChatMessageDto sent = chatService.sendMessage(currentUserId, dto);
        return ResponseEntity.ok(ApiResponse.ok("Message sent", sent));
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<StudentProfileDto>>> getConversations() {
        Long currentUserId = authService.getCurrentUserId();
        List<StudentProfileDto> partners = chatService.getConversationPartners(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Conversation partners retrieved", partners));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        Long currentUserId = authService.getCurrentUserId();
        long count = chatService.getUnreadCount(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Unread count", count));
    }
}
