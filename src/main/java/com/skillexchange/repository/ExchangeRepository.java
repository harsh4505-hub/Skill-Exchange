package com.skillexchange.repository;

import com.skillexchange.entity.Exchange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExchangeRepository extends JpaRepository<Exchange, Long> {
    @Query("SELECT e FROM Exchange e WHERE (e.student1.id = :userId OR e.student2.id = :userId) ORDER BY e.startDate DESC")
    List<Exchange> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT e FROM Exchange e WHERE (e.student1.id = :userId OR e.student2.id = :userId) AND e.status = :status ORDER BY e.startDate DESC")
    List<Exchange> findAllByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    List<Exchange> findByStatus(String status);
    long countByStatus(String status);
}
