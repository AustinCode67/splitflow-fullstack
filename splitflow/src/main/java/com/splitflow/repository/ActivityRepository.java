package com.splitflow.repository;

import com.splitflow.model.Activity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository
        extends JpaRepository<Activity, Long> {

    List<Activity> findByGroupIdOrderByCreatedAtDesc(
            Long groupId);

    void deleteByGroupId(
            Long groupId);
}