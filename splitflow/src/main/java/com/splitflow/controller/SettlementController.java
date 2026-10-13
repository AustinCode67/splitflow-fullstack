package com.splitflow.controller;

import com.splitflow.model.Settlement;
import com.splitflow.service.GroupService;
import com.splitflow.service.SettlementService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/groups/{groupId}")
public class SettlementController {

    private final SettlementService settlementService;
    private final GroupService groupService;

    public SettlementController(
            SettlementService settlementService,
            GroupService groupService) {

        this.settlementService = settlementService;
        this.groupService = groupService;
    }

    // =========================================================
    // BALANCES
    // =========================================================

    @GetMapping("/balances")
    public Map<String, BigDecimal> getBalances(
            @PathVariable Long groupId,
            Authentication authentication) {

        String requesterEmail = authentication.getName();

        groupService.verifyGroupMemberAccess(
                groupId,
                requesterEmail);

        return settlementService
                .getBalances(groupId);
    }

    // =========================================================
    // SETTLEMENTS
    // =========================================================

    @GetMapping("/settlements")
    public List<Settlement> getSettlements(
            @PathVariable Long groupId,
            Authentication authentication) {

        String requesterEmail = authentication.getName();

        groupService.verifyGroupMemberAccess(
                groupId,
                requesterEmail);

        return settlementService
                .getSettlements(groupId);
    }
}