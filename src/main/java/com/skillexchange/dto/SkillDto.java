package com.skillexchange.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SkillDto {
    private Long id;

    @NotBlank(message = "Skill name is required")
    private String name;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String categoryName;
    private String description;

    public SkillDto() {
    }

    public SkillDto(Long id, String name, Long categoryId, String categoryName, String description) {
        this.id = id;
        this.name = name;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
