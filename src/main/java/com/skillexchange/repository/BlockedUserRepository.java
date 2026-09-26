package com.skillexchange.repository;

import com.skillexchange.entity.BlockedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockedUserRepository extends JpaRepository<BlockedUser, Long> {
    boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);
    Optional<BlockedUser> findByBlockerIdAndBlockedId(Long blockerId, Long blockedId);
    List<BlockedUser> findByBlockerId(Long blockerId);
}
