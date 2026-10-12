package com.splitflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "group_members")
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;

    private String userEmail;

    public GroupMember() {
    }

    public GroupMember(Long groupId, String userEmail) {
        this.groupId = groupId;
        this.userEmail = userEmail;
    }

    public Long getId() {
        return id;
    }

    public Long getGroupId() {
        return groupId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
}