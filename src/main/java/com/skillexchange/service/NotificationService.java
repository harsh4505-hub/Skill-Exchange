package com.skillexchange.service;

import com.skillexchange.dto.NotificationDto;
import com.skillexchange.entity.Notification;
import com.skillexchange.entity.User;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * NotificationService manages real-time student in-app alerts and notifications.
 */
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(User recipient, String title, String message, String type, Long relatedEntityId) {
        Notification notification = new Notification(recipient, title, message, type, relatedEntityId);
        return notificationRepository.save(notification);
    }

    public List<NotificationDto> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
                .map(n -> new NotificationDto(
                        n.getId(),
                        n.getRecipient().getId(),
                        n.getTitle(),
                        n.getMessage(),
                        n.getType(),
                        n.getRelatedEntityId(),
                        n.isRead(),
                        n.getCreatedAt()
                )).collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (notification.getRecipient().getId().equals(userId)) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }
}
