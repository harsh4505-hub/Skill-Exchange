package com.skillexchange.service;

import com.skillexchange.dto.ChatMessageDto;
import com.skillexchange.dto.StudentProfileDto;
import com.skillexchange.entity.ChatMessage;
import com.skillexchange.entity.User;
import com.skillexchange.exception.BadRequestException;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.repository.BlockedUserRepository;
import com.skillexchange.repository.ChatMessageRepository;
import com.skillexchange.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ChatService manages peer-to-peer student messaging, conversation tracking,
 * and read/unread status updates.
 */
@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileService profileService;

    @Autowired
    private BlockedUserRepository blockedUserRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ChatMessageDto sendMessage(Long senderId, ChatMessageDto dto) {
        if (senderId.equals(dto.getReceiverId())) {
            throw new BadRequestException("You cannot send messages to yourself");
        }

        if (blockedUserRepository.existsByBlockerIdAndBlockedId(dto.getReceiverId(), senderId) ||
            blockedUserRepository.existsByBlockerIdAndBlockedId(senderId, dto.getReceiverId())) {
            throw new BadRequestException("Cannot send message due to block status");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found: " + senderId));
        User receiver = userRepository.findById(dto.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found: " + dto.getReceiverId()));

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setMessageText(dto.getMessageText().trim());
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);

        ChatMessage saved = chatMessageRepository.save(message);

        String senderName = sender.getStudentProfile() != null ? sender.getStudentProfile().getFullName() : sender.getEmail();
        notificationService.createNotification(
                receiver,
                "New Message from " + senderName,
                dto.getMessageText().length() > 60 ? dto.getMessageText().substring(0, 57) + "..." : dto.getMessageText(),
                "NEW_MESSAGE",
                senderId
        );

        return mapToDto(saved);
    }

    @Transactional
    public List<ChatMessageDto> getConversation(Long user1Id, Long user2Id) {
        List<ChatMessage> messages = chatMessageRepository.findConversationBetween(user1Id, user2Id);

        // Mark incoming unread messages as read
        List<ChatMessage> toUpdate = new ArrayList<>();
        for (ChatMessage m : messages) {
            if (m.getReceiver().getId().equals(user1Id) && !m.isRead()) {
                m.setRead(true);
                toUpdate.add(m);
            }
        }
        if (!toUpdate.isEmpty()) {
            chatMessageRepository.saveAll(toUpdate);
        }

        return messages.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<StudentProfileDto> getConversationPartners(Long currentUserId) {
        List<Long> partnerIds = chatMessageRepository.findDistinctConversationPartnerIds(currentUserId);
        List<StudentProfileDto> partners = new ArrayList<>();
        for (Long id : partnerIds) {
            try {
                partners.add(profileService.getProfileDto(id));
            } catch (Exception ignored) {
            }
        }
        return partners;
    }

    public long getUnreadCount(Long userId) {
        return chatMessageRepository.countUnreadMessagesForUser(userId);
    }

    private ChatMessageDto mapToDto(ChatMessage m) {
        return new ChatMessageDto(
                m.getId(),
                m.getSender().getId(),
                m.getSender().getStudentProfile() != null ? m.getSender().getStudentProfile().getFullName() : m.getSender().getEmail(),
                m.getReceiver().getId(),
                m.getReceiver().getStudentProfile() != null ? m.getReceiver().getStudentProfile().getFullName() : m.getReceiver().getEmail(),
                m.getMessageText(),
                m.getSentAt(),
                m.isRead()
        );
    }
}
