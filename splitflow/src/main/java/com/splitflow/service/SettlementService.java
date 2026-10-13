package com.splitflow.service;

import com.splitflow.model.Expense;
import com.splitflow.model.ExpenseSplit;
import com.splitflow.model.Payment;
import com.splitflow.model.Settlement;

import com.splitflow.repository.ExpenseRepository;
import com.splitflow.repository.ExpenseSplitRepository;
import com.splitflow.repository.PaymentRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SettlementService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final PaymentRepository paymentRepository;

    public SettlementService(
            ExpenseRepository expenseRepository,
            ExpenseSplitRepository expenseSplitRepository,
            PaymentRepository paymentRepository) {

        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
        this.paymentRepository = paymentRepository;
    }

    // =========================================================
    // GET BALANCES
    // =========================================================

    public Map<String, BigDecimal> getBalances(
            Long groupId) {

        Map<String, BigDecimal> balances = new HashMap<>();

        // -----------------------------------------------------
        // EXPENSES
        // -----------------------------------------------------

        List<Expense> expenses = expenseRepository.findByGroupId(
                groupId);

        for (Expense expense : expenses) {

            String payer = expense.getPaidByEmail();

            BigDecimal amount = expense.getAmount();

            if (payer == null ||
                    amount == null) {

                continue;
            }

            // Payer initially gets credit
            balances.put(
                    payer,
                    balances.getOrDefault(
                            payer,
                            BigDecimal.ZERO)
                            .add(amount));

            // Get expense splits
            List<ExpenseSplit> splits = expenseSplitRepository
                    .findByExpenseId(
                            expense.getId());

            for (ExpenseSplit split : splits) {

                String user = split.getUserEmail();

                BigDecimal owed = split.getAmountOwed();

                if (user == null ||
                        owed == null) {

                    continue;
                }

                // Each member owes their share
                balances.put(
                        user,
                        balances.getOrDefault(
                                user,
                                BigDecimal.ZERO)
                                .subtract(owed));
            }
        }

        // -----------------------------------------------------
        // PAYMENTS
        // -----------------------------------------------------

        List<Payment> payments = paymentRepository.findByGroupId(
                groupId);

        for (Payment payment : payments) {

            if (payment.getAmount() == null) {
                continue;
            }

            String fromUser = payment.getFromUser();

            String toUser = payment.getToUser();

            BigDecimal amount = payment.getAmount();

            /*
             * If A owes B RM50 and A pays B RM50:
             *
             * A's balance increases toward zero.
             * B's balance decreases toward zero.
             */

            if (fromUser != null) {

                balances.put(
                        fromUser,
                        balances.getOrDefault(
                                fromUser,
                                BigDecimal.ZERO)
                                .add(amount));
            }

            if (toUser != null) {

                balances.put(
                        toUser,
                        balances.getOrDefault(
                                toUser,
                                BigDecimal.ZERO)
                                .subtract(amount));
            }
        }

        // -----------------------------------------------------
        // ROUND BALANCES
        // -----------------------------------------------------

        balances.replaceAll(
                (email, balance) -> balance.setScale(
                        2,
                        RoundingMode.HALF_UP));

        return balances;
    }

    // =========================================================
    // GET SETTLEMENT RECOMMENDATIONS
    // =========================================================

    public List<Settlement> getSettlements(
            Long groupId) {

        Map<String, BigDecimal> balances = getBalances(groupId);

        List<AccountBalance> creditors = new ArrayList<>();

        List<AccountBalance> debtors = new ArrayList<>();

        // -----------------------------------------------------
        // SEPARATE CREDITORS AND DEBTORS
        // -----------------------------------------------------

        for (Map.Entry<String, BigDecimal> entry : balances.entrySet()) {

            String email = entry.getKey();

            BigDecimal balance = entry.getValue();

            if (balance.compareTo(
                    BigDecimal.ZERO) > 0) {

                creditors.add(
                        new AccountBalance(
                                email,
                                balance));

            } else if (balance.compareTo(
                    BigDecimal.ZERO) < 0) {

                debtors.add(
                        new AccountBalance(
                                email,
                                balance.abs()));
            }
        }

        List<Settlement> settlements = new ArrayList<>();

        int debtorIndex = 0;
        int creditorIndex = 0;

        // -----------------------------------------------------
        // MATCH DEBTORS WITH CREDITORS
        // -----------------------------------------------------

        while (debtorIndex < debtors.size() &&
                creditorIndex < creditors.size()) {

            AccountBalance debtor = debtors.get(
                    debtorIndex);

            AccountBalance creditor = creditors.get(
                    creditorIndex);

            BigDecimal settlementAmount = debtor.amount.min(
                    creditor.amount);

            settlementAmount = settlementAmount.setScale(
                    2,
                    RoundingMode.HALF_UP);

            if (settlementAmount.compareTo(
                    BigDecimal.ZERO) > 0) {

                settlements.add(
                        new Settlement(
                                debtor.email,
                                creditor.email,
                                settlementAmount));
            }

            debtor.amount = debtor.amount.subtract(
                    settlementAmount);

            creditor.amount = creditor.amount.subtract(
                    settlementAmount);

            if (debtor.amount.compareTo(
                    BigDecimal.ZERO) == 0) {

                debtorIndex++;
            }

            if (creditor.amount.compareTo(
                    BigDecimal.ZERO) == 0) {

                creditorIndex++;
            }
        }

        return settlements;
    }

    // =========================================================
    // INTERNAL BALANCE CLASS
    // =========================================================

    private static class AccountBalance {

        private final String email;

        private BigDecimal amount;

        public AccountBalance(
                String email,
                BigDecimal amount) {

            this.email = email;

            this.amount = amount;
        }
    }
}