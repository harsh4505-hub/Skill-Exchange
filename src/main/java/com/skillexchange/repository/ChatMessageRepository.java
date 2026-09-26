package com.skillexchange.repository;

import com.skillexchange.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.sender.id = :user1Id AND m.receiver.id = :user2Id) OR " +
           "(m.sender.id = :user2Id AND m.receiver.id = :user1Id) " +
           "ORDER BY m.sentAt ASC")
    List<ChatMessage> findConversationBetween(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiver.id = :userId AND m.isRead = false")
    long countUnreadMessagesForUser(@Param("userId") Long userId);

    @Query("SELECT DISTINCT CASE WHEN m.sender.id = :userId THEN m.receiver.id ELSE m.sender.id END " +
           "FROM ChatMessage m WHERE m.sender.id = :userId OR m.receiver.id = :userId")
    List<Long> findDistinctConversationPartnerIds(@Param("userId") Long userId);
}
