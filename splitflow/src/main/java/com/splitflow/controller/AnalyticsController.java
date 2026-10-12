package com.splitflow.controller;

import com.splitflow.service.AnalyticsService;
import com.splitflow.service.GroupService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/groups/{groupId}/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final GroupService groupService;

    public AnalyticsController(
            AnalyticsService analyticsService,
            GroupService groupService) {

        this.analyticsService = analyticsService;

        this.groupService = groupService;
    }

    // =========================================================
    // GET ANALYTICS
    // GROUP MEMBERS ONLY
    // =========================================================

    @GetMapping
    public Map<String, Object> getAnalytics(
            @PathVariable Long groupId,
            Authentication authentication) {

        String requesterEmail = authentication.getName();

        groupService
                .verifyGroupMemberAccess(
                        groupId,
                        requesterEmail);

        return analyticsService
                .getAnalytics(
                        groupId);
    }
}