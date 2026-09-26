package com.skillexchange.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * SkillCategory Entity grouping skills into intuitive categories
 * such as Programming, Design, Communication, etc.
 */
@Entity
@Table(name = "skill_categories")
public class SkillCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(length = 50)
    private String icon; // Bootstrap icon class, e.g., 'bi-code-slash'

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Skill> skills = new ArrayList<>();

    public SkillCategory() {
    }

    public SkillCategory(String name, String description, String icon) {
        this.name = name;
        this.description = description;
        this.icon = icon;
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

    public List<Skill> getSkills() {
        return skills;
    }

    public void setSkills(List<Skill> skills) {
        this.skills = skills;
    }
}
