package com.skillexchange.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Exchange Entity representing an active or completed mutual skill exchange contract.
 */
@Entity
@Table(name = "exchanges")
public class Exchange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "request_id", nullable = false)
    private ExchangeRequest request;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student1_id", nullable = false)
    private User student1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student2_id", nullable = false)
    private User student2;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill1_id", nullable = false)
    private Skill skill1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill2_id", nullable = false)
    private Skill skill2;

    @Column(name = "learning_mode", nullable = false, length = 30)
    private String learningMode;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, CANCELLED

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate = LocalDateTime.now();

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    public Exchange() {
    }

    public Exchange(ExchangeRequest request, User student1, User student2, Skill skill1, Skill skill2, String learningMode) {
        this.request = request;
        this.student1 = student1;
        this.student2 = student2;
        this.skill1 = skill1;
        this.skill2 = skill2;
        this.learningMode = learningMode;
        this.status = "ACTIVE";
        this.startDate = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ExchangeRequest getRequest() {
        return request;
    }

    public void setRequest(ExchangeRequest request) {
        this.request = request;
    }

    public User getStudent1() {
        return student1;
    }

    public void setStudent1(User student1) {
        this.student1 = student1;
    }

    public User getStudent2() {
        return student2;
    }

    public void setStudent2(User student2) {
        this.student2 = student2;
    }

    public Skill getSkill1() {
        return skill1;
    }

    public void setSkill1(Skill skill1) {
        this.skill1 = skill1;
    }

    public Skill getSkill2() {
        return skill2;
    }

    public void setSkill2(Skill skill2) {
        this.skill2 = skill2;
    }

    public String getLearningMode() {
        return learningMode;
    }

    public void setLearningMode(String learningMode) {
        this.learningMode = learningMode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDateTime completionDate) {
        this.completionDate = completionDate;
    }
}
