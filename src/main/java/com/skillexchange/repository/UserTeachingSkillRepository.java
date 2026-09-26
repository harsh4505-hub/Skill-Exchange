package com.skillexchange.repository;

import com.skillexchange.entity.UserTeachingSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTeachingSkillRepository extends JpaRepository<UserTeachingSkill, Long> {
    List<UserTeachingSkill> findByUserId(Long userId);
    List<UserTeachingSkill> findBySkillId(Long skillId);
    boolean existsByUserIdAndSkillId(Long userId, Long skillId);
    Optional<UserTeachingSkill> findByUserIdAndSkillId(Long userId, Long skillId);
    void deleteByUserIdAndSkillId(Long userId, Long skillId);
}
