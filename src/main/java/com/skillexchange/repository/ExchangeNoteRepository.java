package com.skillexchange.repository;

import com.skillexchange.entity.ExchangeNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExchangeNoteRepository extends JpaRepository<ExchangeNote, Long> {

    List<ExchangeNote> findByStudentId(Long studentId);

    List<ExchangeNote> findByStudentIdAndPartnerId(Long studentId, Long partnerId);

    List<ExchangeNote> findByExchangeRequestId(Long exchangeRequestId);
}
