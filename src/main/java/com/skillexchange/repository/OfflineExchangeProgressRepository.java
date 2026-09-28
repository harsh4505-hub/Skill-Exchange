package com.skillexchange.repository;

import com.skillexchange.entity.OfflineExchangeProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfflineExchangeProgressRepository extends JpaRepository<OfflineExchangeProgress, Long> {

    Optional<OfflineExchangeProgress> findByExchangeRequestId(Long exchangeRequestId);

    List<OfflineExchangeProgress> findByTeacherIdOrLearnerId(Long teacherId, Long learnerId);

    List<OfflineExchangeProgress> findByStatus(String status);
}
