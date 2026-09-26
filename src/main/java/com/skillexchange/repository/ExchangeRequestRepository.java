package com.skillexchange.repository;

import com.skillexchange.entity.ExchangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExchangeRequestRepository extends JpaRepository<ExchangeRequest, Long> {
    List<ExchangeRequest> findBySenderIdOrderByCreatedAtDesc(Long senderId);
    List<ExchangeRequest> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    List<ExchangeRequest> findByReceiverIdAndStatusOrderByCreatedAtDesc(Long receiverId, String status);

    @Query("SELECT r FROM ExchangeRequest r WHERE (r.sender.id = :userId OR r.receiver.id = :userId) ORDER BY r.createdAt DESC")
    List<ExchangeRequest> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT r FROM ExchangeRequest r WHERE (r.sender.id = :userId OR r.receiver.id = :userId) AND r.status = :status ORDER BY r.createdAt DESC")
    List<ExchangeRequest> findAllByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    long countByStatus(String status);
}
