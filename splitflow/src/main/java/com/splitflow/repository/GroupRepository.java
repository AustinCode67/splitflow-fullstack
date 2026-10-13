package com.splitflow.repository;

import com.splitflow.model.Group;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupRepository
        extends JpaRepository<Group, Long> {

    List<Group> findByCreatedByEmail(String email);
}