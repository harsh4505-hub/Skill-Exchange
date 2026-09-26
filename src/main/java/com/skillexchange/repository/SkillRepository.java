package com.skillexchange.repository;

import com.skillexchange.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByCategoryId(Long categoryId);
    Optional<Skill> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<Skill> findByNameContainingIgnoreCase(String keyword);
}
