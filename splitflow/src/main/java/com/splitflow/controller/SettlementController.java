package com.splitflow.controller;

import com.splitflow.model.Settlement;
import com.splitflow.service.SettlementService;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/groups/{groupId}")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(
            SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @GetMapping("/balances")
    public Map<String, BigDecimal> getBalances(
            @PathVariable Long groupId) {
        return settlementService.getBalances(groupId);
    }

    @GetMapping("/settlements")
    public List<Settlement> getSettlements(
            @PathVariable Long groupId) {
        return settlementService.getSettlements(groupId);
    }
}