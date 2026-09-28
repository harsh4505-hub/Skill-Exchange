package com.skillexchange.repository;

import com.skillexchange.entity.OfflineProgressUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfflineProgressUpdateRepository extends JpaRepository<OfflineProgressUpdate, Long> {

    List<OfflineProgressUpdate> findByOfflineExchangeProgressIdOrderByCreatedAtAsc(Long progressId);

    List<OfflineProgressUpdate> findByOfflineExchangeProgressIdOrderByCreatedAtDesc(Long progressId);
}
