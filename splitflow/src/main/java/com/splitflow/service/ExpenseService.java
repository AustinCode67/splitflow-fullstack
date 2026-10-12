package com.splitflow.service;

import com.splitflow.model.DashboardSummary;
import com.splitflow.model.Expense;
import com.splitflow.model.ExpenseRequest;
import com.splitflow.model.ExpenseSplit;
import com.splitflow.model.Group;
import com.splitflow.model.Payment;
import com.splitflow.model.Settlement;

import com.splitflow.repository.ExpenseRepository;
import com.splitflow.repository.ExpenseSplitRepository;
import com.splitflow.repository.GroupMemberRepository;
import com.splitflow.repository.GroupRepository;
import com.splitflow.repository.PaymentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseService {

        private final ExpenseRepository expenseRepository;
        private final GroupMemberRepository groupMemberRepository;
        private final ExpenseSplitRepository expenseSplitRepository;
        private final PaymentRepository paymentRepository;
        private final GroupRepository groupRepository;
        private final ActivityService activityService;

        public ExpenseService(
                        ExpenseRepository expenseRepository,
                        GroupMemberRepository groupMemberRepository,
                        ExpenseSplitRepository expenseSplitRepository,
                        PaymentRepository paymentRepository,
                        GroupRepository groupRepository,
                        ActivityService activityService) {

                this.expenseRepository = expenseRepository;
                this.groupMemberRepository = groupMemberRepository;
                this.expenseSplitRepository = expenseSplitRepository;
                this.paymentRepository = paymentRepository;
                this.groupRepository = groupRepository;
                this.activityService = activityService;
        }

        // =========================================================
        // VERIFY GROUP MEMBER ACCESS
        // =========================================================

        public void verifyGroupMemberAccess(
                        Long groupId,
                        String requesterEmail) {

                if (requesterEmail == null ||
                                requesterEmail.isBlank()) {

                        throw new RuntimeException(
                                        "Authentication required.");
                }

                if (!groupRepository.existsById(groupId)) {

                        throw new RuntimeException(
                                        "Group not found.");
                }

                boolean isMember = groupMemberRepository
                                .existsByGroupIdAndUserEmail(
                                                groupId,
                                                requesterEmail);

                if (!isMember) {

                        throw new RuntimeException(
                                        "You are not a member of this group.");
                }
        }

        // =========================================================
        // CREATE EXPENSE
        // =========================================================

        @Transactional
        public Expense createExpense(
                        Long groupId,
                        ExpenseRequest request) {

                if (request == null) {

                        throw new RuntimeException(
                                        "Expense request is required.");
                }

                String description = request.getDescription();

                BigDecimal amount = request.getAmount();

                String paidByEmail = request.getPaidByEmail();

                String category = request.getCategory();

                List<String> participants = request.getParticipants();

                String splitType = request.getSplitType();

                Map<String, BigDecimal> splitValues = request.getSplitValues();

                // Description validation
                if (description == null ||
                                description.isBlank()) {

                        throw new RuntimeException(
                                        "Expense description is required.");
                }

                // Amount validation
                if (amount == null ||
                                amount.compareTo(
                                                BigDecimal.ZERO) <= 0) {

                        throw new RuntimeException(
                                        "Expense amount must be greater than 0.");
                }

                // Payer validation
                if (paidByEmail == null ||
                                paidByEmail.isBlank()) {

                        throw new RuntimeException(
                                        "Payer is required.");
                }

                verifyGroupMemberAccess(
                                groupId,
                                paidByEmail);

                // Participants validation
                if (participants == null ||
                                participants.isEmpty()) {

                        throw new RuntimeException(
                                        "At least one participant is required.");
                }

                for (String participant : participants) {

                        if (participant == null ||
                                        participant.isBlank()) {

                                throw new RuntimeException(
                                                "Participant email cannot be empty.");
                        }

                        if (!groupMemberRepository
                                        .existsByGroupIdAndUserEmail(
                                                        groupId,
                                                        participant)) {

                                throw new RuntimeException(
                                                participant +
                                                                " is not a member of this group.");
                        }
                }

                // Default split
                if (splitType == null ||
                                splitType.isBlank()) {

                        splitType = "EQUAL";
                }

                splitType = splitType.toUpperCase();

                validateSplit(
                                amount,
                                participants,
                                splitType,
                                splitValues);

                // Default category
                if (category == null ||
                                category.isBlank()) {

                        category = "Other";
                }

                Expense expense = new Expense(
                                groupId,
                                description.trim(),
                                amount,
                                paidByEmail,
                                category);

                Expense savedExpense = expenseRepository.save(
                                expense);

                // Create splits
                switch (splitType) {

                        case "EQUAL" ->
                                createEqualSplits(
                                                savedExpense,
                                                amount,
                                                participants);

                        case "EXACT" ->
                                createExactSplits(
                                                savedExpense,
                                                participants,
                                                splitValues);

                        case "PERCENTAGE" ->
                                createPercentageSplits(
                                                savedExpense,
                                                amount,
                                                participants,
                                                splitValues);

                        default ->
                                throw new RuntimeException(
                                                "Invalid split type.");
                }

                // Activity history
                activityService.recordActivity(
                                groupId,
                                paidByEmail,
                                "EXPENSE_CREATED",
                                paidByEmail +
                                                " added expense \"" +
                                                description.trim() +
                                                "\" — RM " +
                                                amount.setScale(
                                                                2,
                                                                RoundingMode.HALF_UP));

                return savedExpense;
        }

        // =========================================================
        // VALIDATE SPLIT
        // =========================================================

        private void validateSplit(
                        BigDecimal amount,
                        List<String> participants,
                        String splitType,
                        Map<String, BigDecimal> splitValues) {

                switch (splitType) {

                        case "EQUAL" -> {
                                // No extra values required
                        }

                        case "EXACT" -> {

                                validateSplitValues(
                                                participants,
                                                splitValues);

                                BigDecimal total = BigDecimal.ZERO;

                                for (String participant : participants) {

                                        BigDecimal value = splitValues.get(
                                                        participant);

                                        total = total.add(
                                                        value);
                                }

                                if (total.compareTo(
                                                amount) != 0) {

                                        throw new RuntimeException(
                                                        "Exact split amounts must equal the total expense.");
                                }
                        }

                        case "PERCENTAGE" -> {

                                validateSplitValues(
                                                participants,
                                                splitValues);

                                BigDecimal totalPercentage = BigDecimal.ZERO;

                                for (String participant : participants) {

                                        BigDecimal value = splitValues.get(
                                                        participant);

                                        totalPercentage = totalPercentage.add(
                                                        value);
                                }

                                if (totalPercentage.compareTo(
                                                new BigDecimal(
                                                                "100")) != 0) {

                                        throw new RuntimeException(
                                                        "Percentages must add up to 100.");
                                }
                        }

                        default ->
                                throw new RuntimeException(
                                                "Invalid split type.");
                }
        }

        // =========================================================
        // VALIDATE SPLIT VALUES
        // =========================================================

        private void validateSplitValues(
                        List<String> participants,
                        Map<String, BigDecimal> splitValues) {

                if (splitValues == null ||
                                splitValues.isEmpty()) {

                        throw new RuntimeException(
                                        "Split values are required.");
                }

                // Make sure every key is a participant
                for (String email : splitValues.keySet()) {

                        if (!participants.contains(
                                        email)) {

                                throw new RuntimeException(
                                                email +
                                                                " is not included in the participants.");
                        }

                        BigDecimal value = splitValues.get(
                                        email);

                        if (value == null) {

                                throw new RuntimeException(
                                                "Split value is required for " +
                                                                email + ".");
                        }

                        if (value.compareTo(
                                        BigDecimal.ZERO) < 0) {

                                throw new RuntimeException(
                                                "Split values cannot be negative.");
                        }
                }

                // Make sure every participant has a value
                for (String participant : participants) {

                        if (!splitValues.containsKey(
                                        participant)) {

                                throw new RuntimeException(
                                                "Missing split value for " +
                                                                participant + ".");
                        }

                        BigDecimal value = splitValues.get(
                                        participant);

                        if (value == null) {

                                throw new RuntimeException(
                                                "Split value is required for " +
                                                                participant + ".");
                        }

                        if (value.compareTo(
                                        BigDecimal.ZERO) < 0) {

                                throw new RuntimeException(
                                                "Split values cannot be negative.");
                        }
                }
        }

        // =========================================================
        // CREATE EQUAL SPLITS
        // =========================================================

        private void createEqualSplits(
                        Expense expense,
                        BigDecimal amount,
                        List<String> participants) {

                int count = participants.size();

                BigDecimal amountPerPerson = amount.divide(
                                BigDecimal.valueOf(
                                                count),
                                2,
                                RoundingMode.HALF_UP);

                BigDecimal assigned = BigDecimal.ZERO;

                for (int i = 0; i < count; i++) {

                        String email = participants.get(i);

                        BigDecimal amountOwed;

                        // Give rounding remainder to last participant
                        if (i == count - 1) {

                                amountOwed = amount.subtract(
                                                assigned);

                        } else {

                                amountOwed = amountPerPerson;

                                assigned = assigned.add(
                                                amountOwed);
                        }

                        ExpenseSplit split = new ExpenseSplit(
                                        expense.getId(),
                                        email,
                                        amountOwed);

                        expenseSplitRepository.save(
                                        split);
                }
        }

        // =========================================================
        // CREATE EXACT SPLITS
        // =========================================================

        private void createExactSplits(
                        Expense expense,
                        List<String> participants,
                        Map<String, BigDecimal> splitValues) {

                for (String email : participants) {

                        ExpenseSplit split = new ExpenseSplit(
                                        expense.getId(),
                                        email,
                                        splitValues.get(
                                                        email));

                        expenseSplitRepository.save(
                                        split);
                }
        }

        // =========================================================
        // CREATE PERCENTAGE SPLITS
        // =========================================================

        private void createPercentageSplits(
                        Expense expense,
                        BigDecimal amount,
                        List<String> participants,
                        Map<String, BigDecimal> splitValues) {

                BigDecimal assigned = BigDecimal.ZERO;

                for (int i = 0; i < participants.size(); i++) {

                        String email = participants.get(i);

                        BigDecimal amountOwed;

                        if (i == participants.size() - 1) {

                                // Last participant gets rounding remainder
                                amountOwed = amount.subtract(
                                                assigned);

                        } else {

                                BigDecimal percentage = splitValues.get(
                                                email);

                                amountOwed = amount
                                                .multiply(
                                                                percentage)
                                                .divide(
                                                                new BigDecimal(
                                                                                "100"),
                                                                2,
                                                                RoundingMode.HALF_UP);

                                assigned = assigned.add(
                                                amountOwed);
                        }

                        ExpenseSplit split = new ExpenseSplit(
                                        expense.getId(),
                                        email,
                                        amountOwed);

                        expenseSplitRepository.save(
                                        split);
                }
        }

        // =========================================================
        // GET EXPENSES
        // =========================================================

        public List<Expense> getExpenses(
                        Long groupId) {

                return expenseRepository
                                .findByGroupId(
                                                groupId);
        }

        // =========================================================
        // GET EXPENSE SPLITS
        // =========================================================

        public List<ExpenseSplit> getExpenseSplits(
                        Long expenseId) {

                return expenseSplitRepository
                                .findByExpenseId(
                                                expenseId);
        }

        // =========================================================
        // GET EXPENSE SPLITS SECURELY
        // =========================================================

        public List<ExpenseSplit> getExpenseSplitsForGroup(
                        Long groupId,
                        Long expenseId,
                        String requesterEmail) {

                verifyGroupMemberAccess(
                                groupId,
                                requesterEmail);

                Expense expense = expenseRepository
                                .findById(
                                                expenseId)
                                .orElseThrow(
                                                () -> new RuntimeException(
                                                                "Expense not found."));

                if (expense.getGroupId() == null ||
                                !expense.getGroupId()
                                                .equals(groupId)) {

                        throw new RuntimeException(
                                        "Expense does not belong to this group.");
                }

                return expenseSplitRepository
                                .findByExpenseId(
                                                expenseId);
        }

        // =========================================================
        // GROUP BALANCES
        // =========================================================

        public Map<String, BigDecimal> getGroupBalances(
                        Long groupId) {

                List<Expense> expenses = expenseRepository
                                .findByGroupId(
                                                groupId);

                Map<String, BigDecimal> balances = new HashMap<>();

                for (Expense expense : expenses) {

                        String payer = expense.getPaidByEmail();

                        balances.put(
                                        payer,
                                        balances
                                                        .getOrDefault(
                                                                        payer,
                                                                        BigDecimal.ZERO)
                                                        .add(
                                                                        expense.getAmount()));

                        List<ExpenseSplit> splits = expenseSplitRepository
                                        .findByExpenseId(
                                                        expense.getId());

                        for (ExpenseSplit split : splits) {

                                String userEmail = split.getUserEmail();

                                balances.put(
                                                userEmail,
                                                balances
                                                                .getOrDefault(
                                                                                userEmail,
                                                                                BigDecimal.ZERO)
                                                                .subtract(
                                                                                split.getAmountOwed()));
                        }
                }

                // Apply payments
                List<Payment> payments = paymentRepository
                                .findByGroupId(
                                                groupId);

                for (Payment payment : payments) {

                        String fromUser = payment.getFromUser();

                        String toUser = payment.getToUser();

                        BigDecimal paymentAmount = payment.getAmount();

                        // Person paying owes less
                        balances.put(
                                        fromUser,
                                        balances
                                                        .getOrDefault(
                                                                        fromUser,
                                                                        BigDecimal.ZERO)
                                                        .add(
                                                                        paymentAmount));

                        // Person receiving is owed less
                        balances.put(
                                        toUser,
                                        balances
                                                        .getOrDefault(
                                                                        toUser,
                                                                        BigDecimal.ZERO)
                                                        .subtract(
                                                                        paymentAmount));
                }

                return balances;
        }

        // =========================================================
        // SETTLEMENTS
        // =========================================================

        public List<Settlement> getSettlements(
                        Long groupId) {

                Map<String, BigDecimal> balances = getGroupBalances(
                                groupId);

                List<Map.Entry<String, BigDecimal>> creditors = new ArrayList<>();

                List<Map.Entry<String, BigDecimal>> debtors = new ArrayList<>();

                for (Map.Entry<String, BigDecimal> entry : balances.entrySet()) {

                        if (entry.getValue()
                                        .compareTo(
                                                        BigDecimal.ZERO) > 0) {

                                creditors.add(
                                                Map.entry(
                                                                entry.getKey(),
                                                                entry.getValue()));

                        } else if (entry.getValue()
                                        .compareTo(
                                                        BigDecimal.ZERO) < 0) {

                                debtors.add(
                                                Map.entry(
                                                                entry.getKey(),
                                                                entry.getValue()
                                                                                .abs()));
                        }
                }

                List<Settlement> settlements = new ArrayList<>();

                int creditorIndex = 0;
                int debtorIndex = 0;

                while (creditorIndex < creditors.size() &&
                                debtorIndex < debtors.size()) {

                        Map.Entry<String, BigDecimal> creditor = creditors.get(
                                        creditorIndex);

                        Map.Entry<String, BigDecimal> debtor = debtors.get(
                                        debtorIndex);

                        BigDecimal payment = creditor
                                        .getValue()
                                        .min(
                                                        debtor.getValue());

                        settlements.add(
                                        new Settlement(
                                                        debtor.getKey(),
                                                        creditor.getKey(),
                                                        payment));

                        BigDecimal newCreditorAmount = creditor
                                        .getValue()
                                        .subtract(
                                                        payment);

                        BigDecimal newDebtorAmount = debtor
                                        .getValue()
                                        .subtract(
                                                        payment);

                        creditors.set(
                                        creditorIndex,
                                        Map.entry(
                                                        creditor.getKey(),
                                                        newCreditorAmount));

                        debtors.set(
                                        debtorIndex,
                                        Map.entry(
                                                        debtor.getKey(),
                                                        newDebtorAmount));

                        if (newCreditorAmount
                                        .compareTo(
                                                        BigDecimal.ZERO) == 0) {

                                creditorIndex++;
                        }

                        if (newDebtorAmount
                                        .compareTo(
                                                        BigDecimal.ZERO) == 0) {

                                debtorIndex++;
                        }
                }

                return settlements;
        }

        // =========================================================
        // RECORD PAYMENT
        // =========================================================

        @Transactional
        public Payment recordPayment(
                        Long groupId,
                        String fromUser,
                        String toUser,
                        BigDecimal amount) {

                verifyGroupMemberAccess(
                                groupId,
                                fromUser);

                if (toUser == null ||
                                toUser.isBlank()) {

                        throw new RuntimeException(
                                        "Payment receiver is required.");
                }

                if (fromUser.equalsIgnoreCase(
                                toUser)) {

                        throw new RuntimeException(
                                        "You cannot make a payment to yourself.");
                }

                if (amount == null ||
                                amount.compareTo(
                                                BigDecimal.ZERO) <= 0) {

                        throw new RuntimeException(
                                        "Payment amount must be greater than 0.");
                }

                if (!groupMemberRepository
                                .existsByGroupIdAndUserEmail(
                                                groupId,
                                                toUser)) {

                        throw new RuntimeException(
                                        "Payment receiver is not a member of this group.");
                }

                // Get current recommended settlements
                List<Settlement> settlements = getSettlements(
                                groupId);

                Settlement matchingSettlement = null;

                for (Settlement settlement : settlements) {

                        if (settlement.getFromUser()
                                        .equalsIgnoreCase(
                                                        fromUser)
                                        &&
                                        settlement.getToUser()
                                                        .equalsIgnoreCase(
                                                                        toUser)) {

                                matchingSettlement = settlement;

                                break;
                        }
                }

                if (matchingSettlement == null) {

                        throw new RuntimeException(
                                        "No payment is currently required between these users.");
                }

                if (amount.compareTo(
                                matchingSettlement
                                                .getAmount()) > 0) {

                        throw new RuntimeException(
                                        "Payment cannot exceed the amount currently owed.");
                }

                Payment payment = new Payment(
                                groupId,
                                fromUser,
                                toUser,
                                amount);

                Payment savedPayment = paymentRepository.save(
                                payment);

                activityService.recordActivity(
                                groupId,
                                fromUser,
                                "PAYMENT_RECORDED",
                                fromUser +
                                                " paid " +
                                                toUser +
                                                " — RM " +
                                                amount.setScale(
                                                                2,
                                                                RoundingMode.HALF_UP));

                return savedPayment;
        }

        // =========================================================
        // GET PAYMENT HISTORY
        // =========================================================

        public List<Payment> getPayments(
                        Long groupId) {

                return paymentRepository
                                .findByGroupId(
                                                groupId);
        }

        // =========================================================
        // UPDATE EXPENSE
        // =========================================================

        @Transactional
        public Expense updateExpense(
                        Long groupId,
                        Long expenseId,
                        ExpenseRequest request,
                        String requesterEmail) {

                if (request == null) {

                        throw new RuntimeException(
                                        "Expense request is required.");
                }

                Expense expense = expenseRepository
                                .findById(
                                                expenseId)
                                .orElseThrow(
                                                () -> new RuntimeException(
                                                                "Expense not found."));

                if (expense.getGroupId() == null ||
                                !expense.getGroupId()
                                                .equals(groupId)) {

                        throw new RuntimeException(
                                        "Expense does not belong to this group.");
                }

                verifyExpensePermission(
                                groupId,
                                expense,
                                requesterEmail);

                String description = request.getDescription();

                BigDecimal amount = request.getAmount();

                String paidByEmail = request.getPaidByEmail();

                String category = request.getCategory();

                List<String> participants = request.getParticipants();

                String splitType = request.getSplitType();

                Map<String, BigDecimal> splitValues = request.getSplitValues();

                if (description == null ||
                                description.isBlank()) {

                        throw new RuntimeException(
                                        "Expense description is required.");
                }

                if (amount == null ||
                                amount.compareTo(
                                                BigDecimal.ZERO) <= 0) {

                        throw new RuntimeException(
                                        "Expense amount must be greater than 0.");
                }

                if (paidByEmail == null ||
                                paidByEmail.isBlank()) {

                        throw new RuntimeException(
                                        "Payer is required.");
                }

                if (!groupMemberRepository
                                .existsByGroupIdAndUserEmail(
                                                groupId,
                                                paidByEmail)) {

                        throw new RuntimeException(
                                        "Payer is not a member of this group.");
                }

                if (participants == null ||
                                participants.isEmpty()) {

                        throw new RuntimeException(
                                        "At least one participant is required.");
                }

                for (String participant : participants) {

                        if (!groupMemberRepository
                                        .existsByGroupIdAndUserEmail(
                                                        groupId,
                                                        participant)) {

                                throw new RuntimeException(
                                                participant +
                                                                " is not a member of this group.");
                        }
                }

                if (splitType == null ||
                                splitType.isBlank()) {

                        splitType = "EQUAL";
                }

                splitType = splitType.toUpperCase();

                validateSplit(
                                amount,
                                participants,
                                splitType,
                                splitValues);

                if (category == null ||
                                category.isBlank()) {

                        category = "Other";
                }

                expense.setDescription(
                                description.trim());

                expense.setAmount(
                                amount);

                expense.setPaidByEmail(
                                paidByEmail);

                expense.setCategory(
                                category);

                Expense updatedExpense = expenseRepository.save(
                                expense);

                // Remove old splits
                List<ExpenseSplit> oldSplits = expenseSplitRepository
                                .findByExpenseId(
                                                expenseId);

                expenseSplitRepository
                                .deleteAll(
                                                oldSplits);

                expenseSplitRepository.flush();

                // Create new splits
                switch (splitType) {

                        case "EQUAL" ->
                                createEqualSplits(
                                                updatedExpense,
                                                amount,
                                                participants);

                        case "EXACT" ->
                                createExactSplits(
                                                updatedExpense,
                                                participants,
                                                splitValues);

                        case "PERCENTAGE" ->
                                createPercentageSplits(
                                                updatedExpense,
                                                amount,
                                                participants,
                                                splitValues);

                        default ->
                                throw new RuntimeException(
                                                "Invalid split type.");
                }

                activityService.recordActivity(
                                groupId,
                                requesterEmail,
                                "EXPENSE_UPDATED",
                                requesterEmail +
                                                " updated expense \"" +
                                                description.trim() +
                                                "\" — RM " +
                                                amount.setScale(
                                                                2,
                                                                RoundingMode.HALF_UP));

                return updatedExpense;
        }

        // =========================================================
        // DELETE EXPENSE
        // =========================================================

        @Transactional
        public void deleteExpense(
                        Long groupId,
                        Long expenseId,
                        String requesterEmail) {

                Expense expense = expenseRepository
                                .findById(
                                                expenseId)
                                .orElseThrow(
                                                () -> new RuntimeException(
                                                                "Expense not found."));

                if (expense.getGroupId() == null ||
                                !expense.getGroupId()
                                                .equals(groupId)) {

                        throw new RuntimeException(
                                        "Expense does not belong to this group.");
                }

                verifyExpensePermission(
                                groupId,
                                expense,
                                requesterEmail);

                String description = expense.getDescription();

                BigDecimal amount = expense.getAmount();

                List<ExpenseSplit> splits = expenseSplitRepository
                                .findByExpenseId(
                                                expenseId);

                expenseSplitRepository
                                .deleteAll(
                                                splits);

                expenseSplitRepository.flush();

                expenseRepository.delete(
                                expense);

                expenseRepository.flush();

                activityService.recordActivity(
                                groupId,
                                requesterEmail,
                                "EXPENSE_DELETED",
                                requesterEmail +
                                                " deleted expense \"" +
                                                description +
                                                "\" — RM " +
                                                amount.setScale(
                                                                2,
                                                                RoundingMode.HALF_UP));
        }

        // =========================================================
        // VERIFY EXPENSE PERMISSION
        // =========================================================

        private void verifyExpensePermission(
                        Long groupId,
                        Expense expense,
                        String requesterEmail) {

                if (requesterEmail == null ||
                                requesterEmail.isBlank()) {

                        throw new RuntimeException(
                                        "Authentication required.");
                }

                Group group = groupRepository
                                .findById(
                                                groupId)
                                .orElseThrow(
                                                () -> new RuntimeException(
                                                                "Group not found."));

                String ownerEmail = group.getCreatedByEmail();

                String payerEmail = expense.getPaidByEmail();

                boolean isOwner = ownerEmail != null &&
                                ownerEmail.equalsIgnoreCase(
                                                requesterEmail);

                boolean isPayer = payerEmail != null &&
                                payerEmail.equalsIgnoreCase(
                                                requesterEmail);

                if (!isOwner &&
                                !isPayer) {

                        throw new RuntimeException(
                                        "Only the group owner or the payer can modify this expense.");
                }
        }

        // =========================================================
        // CATEGORY SUMMARY
        // =========================================================

        public Map<String, BigDecimal> getCategorySummary(
                        Long groupId) {

                List<Expense> expenses = expenseRepository
                                .findByGroupId(
                                                groupId);

                Map<String, BigDecimal> summary = new LinkedHashMap<>();

                for (Expense expense : expenses) {

                        String expenseCategory = expense.getCategory();

                        if (expenseCategory == null ||
                                        expenseCategory.isBlank()) {

                                expenseCategory = "Other";
                        }

                        summary.put(
                                        expenseCategory,
                                        summary
                                                        .getOrDefault(
                                                                        expenseCategory,
                                                                        BigDecimal.ZERO)
                                                        .add(
                                                                        expense.getAmount()));
                }

                return summary;
        }

        // =========================================================
        // BUDGET SUMMARY
        // =========================================================

        public Map<String, Object> getBudgetSummary(
                        Long groupId) {

                Group group = groupRepository
                                .findById(
                                                groupId)
                                .orElseThrow(
                                                () -> new RuntimeException(
                                                                "Group not found."));

                BigDecimal budget = group.getBudget();

                if (budget == null) {

                        budget = BigDecimal.ZERO;
                }

                List<Expense> expenses = expenseRepository
                                .findByGroupId(
                                                groupId);

                BigDecimal spent = BigDecimal.ZERO;

                for (Expense expense : expenses) {

                        spent = spent.add(
                                        expense.getAmount());
                }

                BigDecimal remaining = budget.subtract(
                                spent);

                BigDecimal percentageUsed = BigDecimal.ZERO;

                if (budget.compareTo(
                                BigDecimal.ZERO) > 0) {

                        percentageUsed = spent
                                        .multiply(
                                                        new BigDecimal(
                                                                        "100"))
                                        .divide(
                                                        budget,
                                                        2,
                                                        RoundingMode.HALF_UP);
                }

                String status;

                if (percentageUsed.compareTo(
                                new BigDecimal(
                                                "100")) >= 0) {

                        status = "OVER_BUDGET";

                } else if (percentageUsed.compareTo(
                                new BigDecimal(
                                                "80")) >= 0) {

                        status = "WARNING";

                } else {

                        status = "GOOD";
                }

                Map<String, Object> summary = new LinkedHashMap<>();

                summary.put(
                                "budget",
                                budget);

                summary.put(
                                "spent",
                                spent);

                summary.put(
                                "remaining",
                                remaining);

                summary.put(
                                "percentageUsed",
                                percentageUsed);

                summary.put(
                                "status",
                                status);

                return summary;
        }

        // =========================================================
        // DASHBOARD
        // =========================================================

        public DashboardSummary getDashboardSummary(
                        Long groupId) {

                Map<String, Object> budgetSummary = getBudgetSummary(
                                groupId);

                Map<String, BigDecimal> categorySummary = getCategorySummary(
                                groupId);

                Map<String, BigDecimal> balances = getGroupBalances(
                                groupId);

                List<Expense> expenses = expenseRepository
                                .findByGroupId(
                                                groupId);

                List<Expense> recentExpenses = expenses
                                .stream()
                                .sorted(
                                                (a, b) -> b.getId()
                                                                .compareTo(
                                                                                a.getId()))
                                .limit(5)
                                .toList();

                return new DashboardSummary(
                                budgetSummary,
                                categorySummary,
                                balances,
                                recentExpenses);
        }
}