package com.skillexchange.service;

import com.skillexchange.entity.ExchangeNote;
import com.skillexchange.entity.ExchangeRequest;
import com.skillexchange.entity.User;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.repository.ExchangeNoteRepository;
import com.skillexchange.repository.ExchangeRequestRepository;
import com.skillexchange.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExchangeNoteService {

    private final ExchangeNoteRepository exchangeNoteRepository;
    private final UserRepository userRepository;
    private final ExchangeRequestRepository exchangeRequestRepository;

    public ExchangeNoteService(ExchangeNoteRepository exchangeNoteRepository,
                               UserRepository userRepository,
                               ExchangeRequestRepository exchangeRequestRepository) {
        this.exchangeNoteRepository = exchangeNoteRepository;
        this.userRepository = userRepository;
        this.exchangeRequestRepository = exchangeRequestRepository;
    }

    @Transactional
    public ExchangeNote createNote(User currentUser, Long partnerId, Long exchangeRequestId, String topic, String content) {
        if (currentUser == null) {
            throw new AccessDeniedException("Authentication required to create exchange notes.");
        }
        if (topic == null || topic.trim().isEmpty()) {
            throw new IllegalArgumentException("Note topic is required.");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Note content cannot be empty.");
        }

        User partner = null;
        if (partnerId != null) {
            partner = userRepository.findById(partnerId).orElse(null);
        }

        ExchangeRequest req = null;
        if (exchangeRequestId != null) {
            req = exchangeRequestRepository.findById(exchangeRequestId).orElse(null);
        }

        ExchangeNote note = new ExchangeNote(currentUser, partner, req, topic.trim(), content.trim());
        return exchangeNoteRepository.save(note);
    }

    public List<ExchangeNote> getNotes(User currentUser, Long partnerId) {
        if (currentUser == null) {
            throw new AccessDeniedException("Authentication required.");
        }
        if (partnerId != null) {
            return exchangeNoteRepository.findByStudentIdAndPartnerId(currentUser.getId(), partnerId);
        }
        return exchangeNoteRepository.findByStudentId(currentUser.getId());
    }

    @Transactional
    public ExchangeNote updateNote(Long noteId, String topic, String content, User currentUser) {
        if (currentUser == null) throw new AccessDeniedException("Authentication required.");
        ExchangeNote note = exchangeNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + noteId));

        if (!note.getStudent().getId().equals(currentUser.getId()) && !"ROLE_ADMIN".equals(currentUser.getRole())) {
            throw new AccessDeniedException("You can only edit your own notes.");
        }

        if (topic != null && !topic.trim().isEmpty()) note.setTopic(topic.trim());
        if (content != null && !content.trim().isEmpty()) note.setContent(content.trim());
        note.setUpdatedAt(LocalDateTime.now());
        return exchangeNoteRepository.save(note);
    }

    @Transactional
    public void deleteNote(Long noteId, User currentUser) {
        if (currentUser == null) throw new AccessDeniedException("Authentication required.");
        ExchangeNote note = exchangeNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + noteId));

        if (!note.getStudent().getId().equals(currentUser.getId()) && !"ROLE_ADMIN".equals(currentUser.getRole())) {
            throw new AccessDeniedException("You can only delete your own notes.");
        }

        exchangeNoteRepository.delete(note);
    }
}
