package com.splitflow.controller;

import com.splitflow.model.Group;
import com.splitflow.model.GroupMember;
import com.splitflow.service.GroupService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(
            GroupService groupService) {

        this.groupService = groupService;
    }

    // =========================
    // CREATE GROUP
    // =========================

    @PostMapping
    public Group createGroup(
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        String requesterEmail = authentication.getName();

        String name = body.get(
                "name");

        return groupService
                .createGroup(
                        name,
                        requesterEmail);
    }

    // =========================
    // GET USER GROUPS
    // =========================

    @GetMapping
    public List<Group> getGroups(
            Authentication authentication) {

        String requesterEmail = authentication.getName();

        return groupService
                .getGroupsForUser(
                        requesterEmail);
    }

    // =========================
    // GET MEMBERS
    // MEMBERS ONLY
    // =========================

    @GetMapping("/{groupId}/members")
    public List<GroupMember> getMembers(
            @PathVariable Long groupId,
            Authentication authentication) {

        String requesterEmail = authentication.getName();

        return groupService
                .getMembers(
                        groupId,
                        requesterEmail);
    }

    // =========================
    // ADD MEMBER
    // OWNER ONLY
    // =========================

    @PostMapping("/{groupId}/members")
    public GroupMember addMember(
            @PathVariable Long groupId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        String requesterEmail = authentication.getName();

        String memberEmail = body.get(
                "email");

        return groupService
                .addMember(
                        groupId,
                        memberEmail,
                        requesterEmail);
    }

    // =========================
    // UPDATE BUDGET
    // OWNER ONLY
    // =========================

    @PutMapping("/{groupId}/budget")
    public Group setBudget(
            @PathVariable Long groupId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        String requesterEmail = authentication.getName();

        String budgetValue = body.get(
                "budget");

        if (budgetValue == null ||
                budgetValue.isBlank()) {

            throw new RuntimeException(
                    "Budget is required");
        }

        BigDecimal budget;

        try {

            budget = new BigDecimal(
                    budgetValue);

        } catch (NumberFormatException exception) {

            throw new RuntimeException(
                    "Invalid budget value");
        }

        return groupService
                .setBudget(
                        groupId,
                        budget,
                        requesterEmail);
    }

    // =========================
    // REMOVE MEMBER
    // OWNER ONLY
    // =========================

    @DeleteMapping("/{groupId}/members/{memberEmail}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long groupId,
            @PathVariable String memberEmail,
            Authentication authentication) {

        String requesterEmail = authentication.getName();

        groupService
                .removeMember(
                        groupId,
                        memberEmail,
                        requesterEmail);

        return ResponseEntity
                .noContent()
                .build();
    }

    // =========================
    // LEAVE GROUP
    // =========================

    @DeleteMapping("/{groupId}/leave")
    public ResponseEntity<Void> leaveGroup(
            @PathVariable Long groupId,
            Authentication authentication) {

        String requesterEmail = authentication.getName();

        groupService
                .leaveGroup(
                        groupId,
                        requesterEmail);

        return ResponseEntity
                .noContent()
                .build();
    }

    // =========================
    // DELETE GROUP
    // OWNER ONLY
    // =========================

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(
            @PathVariable Long groupId,
            Authentication authentication) {

        String requesterEmail = authentication.getName();

        groupService
                .deleteGroup(
                        groupId,
                        requesterEmail);

        return ResponseEntity
                .noContent()
                .build();
    }
}