package com.splitflow.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardSummary {

    private Map<String, Object> budgetSummary;
    private Map<String, BigDecimal> categorySummary;
    private Map<String, BigDecimal> balances;
    private List<Expense> recentExpenses;

    public DashboardSummary(
            Map<String, Object> budgetSummary,
            Map<String, BigDecimal> categorySummary,
            Map<String, BigDecimal> balances,
            List<Expense> recentExpenses) {

        this.budgetSummary = budgetSummary;
        this.categorySummary = categorySummary;
        this.balances = balances;
        this.recentExpenses = recentExpenses;
    }

    public Map<String, Object> getBudgetSummary() {
        return budgetSummary;
    }

    public Map<String, BigDecimal> getCategorySummary() {
        return categorySummary;
    }

    public Map<String, BigDecimal> getBalances() {
        return balances;
    }

    public List<Expense> getRecentExpenses() {
        return recentExpenses;
    }
}