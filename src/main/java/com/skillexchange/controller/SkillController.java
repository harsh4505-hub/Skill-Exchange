package com.skillexchange.controller;

import com.skillexchange.dto.ApiResponse;
import com.skillexchange.dto.SkillCategoryDto;
import com.skillexchange.dto.SkillDto;
import com.skillexchange.entity.SkillCategory;
import com.skillexchange.service.SkillService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for skill taxonomy and category operations.
 */
@RestController
@RequestMapping("/api/skills")
public class SkillController {

    @Autowired
    private SkillService skillService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillDto>>> getAllSkills() {
        return ResponseEntity.ok(ApiResponse.ok("Skills retrieved", skillService.getAllSkills()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<SkillCategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.ok("Categories retrieved", skillService.getAllCategories()));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<SkillCategory>> createCategory(@RequestBody SkillCategory cat) {
        SkillCategory created = skillService.createCategory(cat.getName(), cat.getDescription(), cat.getIcon());
        return ResponseEntity.ok(ApiResponse.ok("Category created", created));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<SkillDto>>> getSkillsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.ok("Skills for category retrieved", skillService.getSkillsByCategory(categoryId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SkillDto>> getSkillById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Skill retrieved", skillService.getSkillById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SkillDto>> createSkill(@Valid @RequestBody SkillDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Skill created successfully", skillService.createSkill(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SkillDto>> updateSkill(@PathVariable Long id, @Valid @RequestBody SkillDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Skill updated successfully", skillService.updateSkill(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSkill(@PathVariable Long id) {
        skillService.deleteSkill(id);
        return ResponseEntity.ok(ApiResponse.ok("Skill deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SkillDto>>> searchSkills(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.ok("Search results", skillService.searchSkills(keyword)));
    }
}
