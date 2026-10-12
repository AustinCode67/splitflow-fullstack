package com.splitflow.service;

import com.splitflow.model.Expense;
import com.splitflow.repository.ExpenseRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final ExpenseRepository expenseRepository;

    public AnalyticsService(
            ExpenseRepository expenseRepository) {

        this.expenseRepository = expenseRepository;
    }

    // =========================================================
    // GET GROUP ANALYTICS
    // =========================================================

    public Map<String, Object> getAnalytics(
            Long groupId) {

        List<Expense> expenses = expenseRepository
                .findByGroupId(groupId);

        Map<String, Object> analytics = new LinkedHashMap<>();

        // No expenses yet
        if (expenses.isEmpty()) {

            analytics.put(
                    "totalExpenses",
                    0);

            analytics.put(
                    "averageExpense",
                    BigDecimal.ZERO);

            analytics.put(
                    "largestExpense",
                    BigDecimal.ZERO);

            analytics.put(
                    "largestExpenseDescription",
                    "None");

            analytics.put(
                    "topPayerEmail",
                    "None");

            analytics.put(
                    "topPayerAmount",
                    BigDecimal.ZERO);

            return analytics;
        }

        // =====================================================
        // TOTAL EXPENSE COUNT
        // =====================================================

        int totalExpenses = expenses.size();

        // =====================================================
        // TOTAL SPENDING
        // =====================================================

        BigDecimal totalSpent = BigDecimal.ZERO;

        for (Expense expense : expenses) {

            totalSpent = totalSpent.add(
                    expense.getAmount());
        }

        // =====================================================
        // AVERAGE EXPENSE
        // =====================================================

        BigDecimal averageExpense = totalSpent.divide(
                BigDecimal.valueOf(
                        totalExpenses),
                2,
                RoundingMode.HALF_UP);

        // =====================================================
        // LARGEST EXPENSE
        // =====================================================

        Expense largestExpense = expenses.get(0);

        for (Expense expense : expenses) {

            if (expense
                    .getAmount()
                    .compareTo(
                            largestExpense
                                    .getAmount()) > 0) {

                largestExpense = expense;
            }
        }

        // =====================================================
        // TOP PAYER
        // =====================================================

        Map<String, BigDecimal> payerTotals = new LinkedHashMap<>();

        for (Expense expense : expenses) {

            String payer = expense.getPaidByEmail();

            BigDecimal currentTotal = payerTotals.getOrDefault(
                    payer,
                    BigDecimal.ZERO);

            payerTotals.put(
                    payer,
                    currentTotal.add(
                            expense.getAmount()));
        }

        String topPayerEmail = "None";

        BigDecimal topPayerAmount = BigDecimal.ZERO;

        for (Map.Entry<String, BigDecimal> entry : payerTotals.entrySet()) {

            if (entry
                    .getValue()
                    .compareTo(
                            topPayerAmount) > 0) {

                topPayerEmail = entry.getKey();

                topPayerAmount = entry.getValue();
            }
        }

        // =====================================================
        // RESULT
        // =====================================================

        analytics.put(
                "totalExpenses",
                totalExpenses);

        analytics.put(
                "averageExpense",
                averageExpense);

        analytics.put(
                "largestExpense",
                largestExpense
                        .getAmount());

        analytics.put(
                "largestExpenseDescription",
                largestExpense
                        .getDescription());

        analytics.put(
                "topPayerEmail",
                topPayerEmail);

        analytics.put(
                "topPayerAmount",
                topPayerAmount);

        return analytics;
    }
}