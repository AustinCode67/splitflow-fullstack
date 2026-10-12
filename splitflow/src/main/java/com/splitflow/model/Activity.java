package com.splitflow.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_activities")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;

    private String actorEmail;

    private String actionType;

    @Column(length = 500)
    private String message;

    private LocalDateTime createdAt;

    public Activity() {
    }

    public Activity(
            Long groupId,
            String actorEmail,
            String actionType,
            String message) {

        this.groupId = groupId;
        this.actorEmail = actorEmail;
        this.actionType = actionType;
        this.message = message;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(
            Long groupId) {

        this.groupId = groupId;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public void setActorEmail(
            String actorEmail) {

        this.actorEmail = actorEmail;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(
            String actionType) {

        this.actionType = actionType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(
            String message) {

        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt = createdAt;
    }
}