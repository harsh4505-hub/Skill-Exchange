package com.skillexchange.service;

import com.skillexchange.dto.SkillCategoryDto;
import com.skillexchange.dto.SkillDto;
import com.skillexchange.entity.Skill;
import com.skillexchange.entity.SkillCategory;
import com.skillexchange.exception.DuplicateResourceException;
import com.skillexchange.exception.ResourceNotFoundException;
import com.skillexchange.repository.SkillCategoryRepository;
import com.skillexchange.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * SkillService manages skills catalogue, domain categories,
 * and skill search queries.
 */
@Service
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository categoryRepository;

    public List<SkillCategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream().map(cat ->
                new SkillCategoryDto(
                        cat.getId(),
                        cat.getName(),
                        cat.getDescription(),
                        cat.getIcon(),
                        cat.getSkills() != null ? cat.getSkills().size() : 0
                )
        ).collect(Collectors.toList());
    }

    @Transactional
    public SkillCategory createCategory(String name, String description, String icon) {
        if (categoryRepository.existsByNameIgnoreCase(name.trim())) {
            throw new DuplicateResourceException("Category already exists: " + name);
        }
        SkillCategory category = new SkillCategory(name.trim(), description, icon);
        return categoryRepository.save(category);
    }

    public List<SkillDto> getAllSkills() {
        return skillRepository.findAll().stream().map(this::toSkillDto).collect(Collectors.toList());
    }

    public List<SkillDto> getSkillsByCategory(Long categoryId) {
        return skillRepository.findByCategoryId(categoryId).stream()
                .map(this::toSkillDto)
                .collect(Collectors.toList());
    }

    public SkillDto getSkillById(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with ID: " + id));
        return toSkillDto(skill);
    }

    @Transactional
    public SkillDto createSkill(SkillDto dto) {
        if (skillRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new DuplicateResourceException("A skill with this name already exists");
        }

        SkillCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        Skill skill = new Skill(dto.getName().trim(), category, dto.getDescription());
        Skill saved = skillRepository.save(skill);
        return toSkillDto(saved);
    }

    @Transactional
    public SkillDto updateSkill(Long id, SkillDto dto) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with ID: " + id));

        SkillCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        skill.setName(dto.getName().trim());
        skill.setCategory(category);
        skill.setDescription(dto.getDescription());
        return toSkillDto(skillRepository.save(skill));
    }

    @Transactional
    public void deleteSkill(Long id) {
        if (!skillRepository.existsById(id)) {
            throw new ResourceNotFoundException("Skill not found with ID: " + id);
        }
        skillRepository.deleteById(id);
    }

    public List<SkillDto> searchSkills(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllSkills();
        }
        return skillRepository.findByNameContainingIgnoreCase(keyword.trim()).stream()
                .map(this::toSkillDto)
                .collect(Collectors.toList());
    }

    public SkillDto toSkillDto(Skill skill) {
        return new SkillDto(
                skill.getId(),
                skill.getName(),
                skill.getCategory().getId(),
                skill.getCategory().getName(),
                skill.getDescription()
        );
    }
}
