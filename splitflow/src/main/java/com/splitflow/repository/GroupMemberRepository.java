package com.splitflow.repository;

import com.splitflow.model.GroupMember;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupMemberRepository
                extends JpaRepository<GroupMember, Long> {

        List<GroupMember> findByGroupId(
                        Long groupId);

        List<GroupMember> findByUserEmail(
                        String userEmail);

        boolean existsByGroupIdAndUserEmail(
                        Long groupId,
                        String userEmail);

        void deleteByGroupIdAndUserEmail(
                        Long groupId,
                        String userEmail);

        void deleteByGroupId(
                        Long groupId);

        void deleteByUserEmail(
                        String userEmail);
}