package com.splitflow.controller;

import com.splitflow.model.DashboardSummary;
import com.splitflow.model.Expense;
import com.splitflow.model.ExpenseRequest;
import com.splitflow.model.ExpenseSplit;
import com.splitflow.model.Payment;
import com.splitflow.model.Settlement;
import com.splitflow.service.ExpenseService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/groups/{groupId}/expenses")
public class ExpenseController {

        private final ExpenseService expenseService;

        public ExpenseController(
                        ExpenseService expenseService) {

                this.expenseService = expenseService;
        }

        // =========================================================
        // VERIFY GROUP ACCESS
        // =========================================================

        private String verifyAccess(
                        Long groupId,
                        Authentication authentication) {

                if (authentication == null ||
                                !authentication.isAuthenticated()) {

                        throw new RuntimeException(
                                        "Authentication required.");
                }

                String requesterEmail = authentication.getName();

                expenseService
                                .verifyGroupMemberAccess(
                                                groupId,
                                                requesterEmail);

                return requesterEmail;
        }

        // =========================================================
        // GET EXPENSES
        // =========================================================

        @GetMapping
        public List<Expense> getExpenses(
                        @PathVariable Long groupId,
                        Authentication authentication) {

                verifyAccess(
                                groupId,
                                authentication);

                return expenseService
                                .getExpenses(groupId);
        }

        // =========================================================
        // CREATE EXPENSE
        // =========================================================

        @PostMapping
        public Expense createExpense(
                        @PathVariable Long groupId,
                        @RequestBody ExpenseRequest request,
                        Authentication authentication) {

                String requesterEmail = verifyAccess(
                                groupId,
                                authentication);

                /*
                 * SECURITY:
                 * Always use the logged-in user
                 * as the payer when creating an expense.
                 *
                 * Do not trust paidByEmail sent
                 * by the frontend.
                 */
                request.setPaidByEmail(
                                requesterEmail);

                return expenseService
                                .createExpense(
                                                groupId,
                                                request);
        }

        // =========================================================
        // GET SPLIT DETAILS
        // =========================================================

        @GetMapping("/{expenseId}/splits")
        public List<ExpenseSplit> getExpenseSplits(
                        @PathVariable Long groupId,
                        @PathVariable Long expenseId,
                        Authentication authentication) {

                String requesterEmail = verifyAccess(
                                groupId,
                                authentication);

                /*
                 * SECURITY FIX:
                 *
                 * We now pass BOTH:
                 * - groupId
                 * - expenseId
                 *
                 * The service checks that the expense
                 * actually belongs to this group.
                 */
                return expenseService
                                .getExpenseSplitsForGroup(
                                                groupId,
                                                expenseId,
                                                requesterEmail);
        }

        // =========================================================
        // UPDATE EXPENSE
        // =========================================================

        @PutMapping("/{expenseId}")
        public Expense updateExpense(
                        @PathVariable Long groupId,
                        @PathVariable Long expenseId,
                        @RequestBody ExpenseRequest request,
                        Authentication authentication) {

                String requesterEmail = verifyAccess(
                                groupId,
                                authentication);

                return expenseService
                                .updateExpense(
                                                groupId,
                                                expenseId,
                                                request,
                                                requesterEmail);
        }

        // =========================================================
        // DELETE EXPENSE
        // =========================================================

        @DeleteMapping("/{expenseId}")
        public void deleteExpense(
                        @PathVariable Long groupId,
                        @PathVariable Long expenseId,
                        Authentication authentication) {

                String requesterEmail = verifyAccess(
                                groupId,
                                authentication);

                expenseService
                                .deleteExpense(
                                                groupId,
                                                expenseId,
                                                requesterEmail);
        }

        // =========================================================
        // BALANCES
        // =========================================================

        @GetMapping("/balances")
        public Map<String, BigDecimal> getBalances(
                        @PathVariable Long groupId,
                        Authentication authentication) {

                verifyAccess(
                                groupId,
                                authentication);

                return expenseService
                                .getGroupBalances(
                                                groupId);
        }

        // =========================================================
        // SETTLEMENTS
        // =========================================================

        @GetMapping("/settlements")
        public List<Settlement> getSettlements(
                        @PathVariable Long groupId,
                        Authentication authentication) {

                verifyAccess(
                                groupId,
                                authentication);

                return expenseService
                                .getSettlements(
                                                groupId);
        }

        // =========================================================
        // RECORD PAYMENT
        // =========================================================

        @PostMapping("/payments")
        public Payment recordPayment(
                        @PathVariable Long groupId,
                        @RequestBody Map<String, Object> request,
                        Authentication authentication) {

                String requesterEmail = verifyAccess(
                                groupId,
                                authentication);

                Object toUserObject = request.get("toUser");

                Object amountObject = request.get("amount");

                if (toUserObject == null) {

                        throw new RuntimeException(
                                        "Payment receiver is required.");
                }

                if (amountObject == null) {

                        throw new RuntimeException(
                                        "Payment amount is required.");
                }

                String toUser = toUserObject.toString();

                BigDecimal amount;

                try {

                        amount = new BigDecimal(
                                        amountObject.toString());

                } catch (NumberFormatException e) {

                        throw new RuntimeException(
                                        "Invalid payment amount.");
                }

                /*
                 * SECURITY:
                 * fromUser is ALWAYS the logged-in user.
                 */
                return expenseService
                                .recordPayment(
                                                groupId,
                                                requesterEmail,
                                                toUser,
                                                amount);
        }

        // =========================================================
        // PAYMENT HISTORY
        // =========================================================

        @GetMapping("/payments")
        public List<Payment> getPayments(
                        @PathVariable Long groupId,
                        Authentication authentication) {

                verifyAccess(
                                groupId,
                                authentication);

                return expenseService
                                .getPayments(
                                                groupId);
        }

        // =========================================================
        // CATEGORY SUMMARY
        // =========================================================

        @GetMapping("/category-summary")
        public Map<String, BigDecimal> getCategorySummary(
                        @PathVariable Long groupId,
                        Authentication authentication) {

                verifyAccess(
                                groupId,
                                authentication);

                return expenseService
                                .getCategorySummary(
                                                groupId);
        }

        // =========================================================
        // BUDGET SUMMARY
        // =========================================================

        @GetMapping("/budget-summary")
        public Map<String, Object> getBudgetSummary(
                        @PathVariable Long groupId,
                        Authentication authentication) {

                verifyAccess(
                                groupId,
                                authentication);

                return expenseService
                                .getBudgetSummary(
                                                groupId);
        }

        // =========================================================
        // DASHBOARD
        // =========================================================

        @GetMapping("/dashboard")
        public DashboardSummary getDashboard(
                        @PathVariable Long groupId,
                        Authentication authentication) {

                verifyAccess(
                                groupId,
                                authentication);

                return expenseService
                                .getDashboardSummary(
                                                groupId);
        }
}