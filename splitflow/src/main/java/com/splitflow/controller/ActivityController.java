package com.splitflow.controller;

import com.splitflow.model.Activity;
import com.splitflow.service.ActivityService;
import com.splitflow.service.GroupService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groups/{groupId}/activities")
public class ActivityController {

    private final ActivityService activityService;
    private final GroupService groupService;

    public ActivityController(
            ActivityService activityService,
            GroupService groupService) {

        this.activityService = activityService;

        this.groupService = groupService;
    }

    // =========================================================
    // GET ACTIVITY HISTORY
    // GROUP MEMBERS ONLY
    // =========================================================

    @GetMapping
    public List<Activity> getActivities(
            @PathVariable Long groupId,
            Authentication authentication) {

        String requesterEmail = authentication.getName();

        groupService
                .verifyGroupMemberAccess(
                        groupId,
                        requesterEmail);

        return activityService
                .getGroupActivities(
                        groupId);
    }
}