package com.skillexchange.entity;

import jakarta.persistence.*;

/**
 * UserLearningSkill Entity linking a student with the skills they want to learn.
 */
@Entity
@Table(name = "user_learning_skills",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "skill_id"}))
public class UserLearningSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "urgency_level", length = 30)
    private String urgencyLevel = "Medium"; // Low, Medium, High

    @Column(length = 500)
    private String notes;

    public UserLearningSkill() {
    }

    public UserLearningSkill(User user, Skill skill, String urgencyLevel) {
        this.user = user;
        this.skill = skill;
        this.urgencyLevel = urgencyLevel;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public String getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(String urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
