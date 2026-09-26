package com.skillexchange.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * BlockedUser Entity representing peer-level blocks to prevent contact or requests.
 */
@Entity
@Table(name = "blocked_users",
       uniqueConstraints = @UniqueConstraint(columnNames = {"blocker_id", "blocked_id"}))
public class BlockedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocker_id", nullable = false)
    private User blocker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocked_id", nullable = false)
    private User blocked;

    @Column(name = "blocked_at", nullable = false)
    private LocalDateTime blockedAt = LocalDateTime.now();

    public BlockedUser() {
    }

    public BlockedUser(User blocker, User blocked) {
        this.blocker = blocker;
        this.blocked = blocked;
        this.blockedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getBlocker() {
        return blocker;
    }

    public void setBlocker(User blocker) {
        this.blocker = blocker;
    }

    public User getBlocked() {
        return blocked;
    }

    public void setBlocked(User blocked) {
        this.blocked = blocked;
    }

    public LocalDateTime getBlockedAt() {
        return blockedAt;
    }

    public void setBlockedAt(LocalDateTime blockedAt) {
        this.blockedAt = blockedAt;
    }
}
