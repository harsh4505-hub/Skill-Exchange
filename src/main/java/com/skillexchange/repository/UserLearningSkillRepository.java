package com.skillexchange.repository;

import com.skillexchange.entity.UserLearningSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLearningSkillRepository extends JpaRepository<UserLearningSkill, Long> {
    List<UserLearningSkill> findByUserId(Long userId);
    List<UserLearningSkill> findBySkillId(Long skillId);
    boolean existsByUserIdAndSkillId(Long userId, Long skillId);
    Optional<UserLearningSkill> findByUserIdAndSkillId(Long userId, Long skillId);
    void deleteByUserIdAndSkillId(Long userId, Long skillId);
}
