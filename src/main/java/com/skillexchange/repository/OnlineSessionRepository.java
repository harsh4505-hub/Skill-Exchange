package com.skillexchange.repository;

import com.skillexchange.entity.OnlineSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OnlineSessionRepository extends JpaRepository<OnlineSession, Long> {

    Optional<OnlineSession> findByExchangeRequestId(Long exchangeRequestId);

    List<OnlineSession> findByTeacherIdOrLearnerId(Long teacherId, Long learnerId);

    List<OnlineSession> findByStatus(String status);
}
