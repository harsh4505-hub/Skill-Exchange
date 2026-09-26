package com.skillexchange.controller;

import com.skillexchange.dto.ApiResponse;
import com.skillexchange.dto.NotificationDto;
import com.skillexchange.service.AuthService;
import com.skillexchange.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for in-app alert notifications.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getMyNotifications() {
        Long currentUserId = authService.getCurrentUserId();
        List<NotificationDto> notifications = notificationService.getNotificationsForUser(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Notifications retrieved", notifications));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable Long id) {
        Long currentUserId = authService.getCurrentUserId();
        notificationService.markAsRead(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead() {
        Long currentUserId = authService.getCurrentUserId();
        notificationService.markAllAsRead(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        Long currentUserId = authService.getCurrentUserId();
        long count = notificationService.getUnreadCount(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok("Unread count", count));
    }
}
