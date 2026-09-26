package com.skillexchange.dto;

public class SkillCategoryDto {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private int skillCount;

    public SkillCategoryDto() {
    }

    public SkillCategoryDto(Long id, String name, String description, String icon, int skillCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.skillCount = skillCount;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public int getSkillCount() {
        return skillCount;
    }

    public void setSkillCount(int skillCount) {
        this.skillCount = skillCount;
    }
}
