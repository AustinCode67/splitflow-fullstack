package com.splitflow.service;

import com.splitflow.model.Activity;
import com.splitflow.repository.ActivityRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(
            ActivityRepository activityRepository) {

        this.activityRepository = activityRepository;
    }

    // =========================================================
    // RECORD ACTIVITY
    // =========================================================

    public Activity recordActivity(
            Long groupId,
            String actorEmail,
            String actionType,
            String message) {

        Activity activity = new Activity(
                groupId,
                actorEmail,
                actionType,
                message);

        return activityRepository
                .save(activity);
    }

    // =========================================================
    // GET GROUP ACTIVITIES
    // =========================================================

    public List<Activity> getGroupActivities(
            Long groupId) {

        return activityRepository
                .findByGroupIdOrderByCreatedAtDesc(
                        groupId);
    }

    // =========================================================
    // DELETE GROUP ACTIVITIES
    // =========================================================

    public void deleteGroupActivities(
            Long groupId) {

        activityRepository
                .deleteByGroupId(
                        groupId);
    }
}