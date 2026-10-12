package com.splitflow.service;

import com.splitflow.model.Expense;
import com.splitflow.model.ExpenseSplit;
import com.splitflow.model.Group;
import com.splitflow.model.GroupMember;
import com.splitflow.model.Payment;

import com.splitflow.repository.ExpenseRepository;
import com.splitflow.repository.ExpenseSplitRepository;
import com.splitflow.repository.GroupMemberRepository;
import com.splitflow.repository.GroupRepository;
import com.splitflow.repository.PaymentRepository;
import com.splitflow.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class GroupService {

        private final GroupRepository groupRepository;
        private final GroupMemberRepository groupMemberRepository;
        private final UserRepository userRepository;
        private final ExpenseRepository expenseRepository;
        private final ExpenseSplitRepository expenseSplitRepository;
        private final PaymentRepository paymentRepository;
        private final ActivityService activityService;

        public GroupService(
                        GroupRepository groupRepository,
                        GroupMemberRepository groupMemberRepository,
                        UserRepository userRepository,
                        ExpenseRepository expenseRepository,
                        ExpenseSplitRepository expenseSplitRepository,
                        PaymentRepository paymentRepository,
                        ActivityService activityService) {

                this.groupRepository = groupRepository;
                this.groupMemberRepository = groupMemberRepository;
                this.userRepository = userRepository;
                this.expenseRepository = expenseRepository;
                this.expenseSplitRepository = expenseSplitRepository;
                this.paymentRepository = paymentRepository;
                this.activityService = activityService;
        }

        // =========================================================
        // CREATE GROUP
        // =========================================================

        public Group createGroup(
                        String name,
                        String email) {

                if (name == null ||
                                name.isBlank()) {

                        throw new RuntimeException(
                                        "Group name is required");
                }

                if (email == null ||
                                email.isBlank()) {

                        throw new RuntimeException(
                                        "Authentication is required");
                }

                Group group = new Group();

                group.setName(
                                name.trim());

                group.setCreatedByEmail(
                                email);

                Group savedGroup = groupRepository.save(
                                group);

                if (!groupMemberRepository
                                .existsByGroupIdAndUserEmail(
                                                savedGroup.getId(),
                                                email)) {

                        GroupMember creatorMember = new GroupMember(
                                        savedGroup.getId(),
                                        email);

                        groupMemberRepository.save(
                                        creatorMember);
                }

                // RECORD ACTIVITY
                activityService.recordActivity(
                                savedGroup.getId(),
                                email,
                                "GROUP_CREATED",
                                email +
                                                " created the group \"" +
                                                savedGroup.getName() +
                                                "\"");

                return savedGroup;
        }

        // =========================================================
        // GET GROUPS FOR USER
        // =========================================================

        public List<Group> getGroupsForUser(
                        String email) {

                if (email == null ||
                                email.isBlank()) {

                        throw new RuntimeException(
                                        "Authentication is required");
                }

                List<GroupMember> memberships = groupMemberRepository
                                .findByUserEmail(
                                                email);

                return memberships
                                .stream()
                                .map(
                                                member -> groupRepository
                                                                .findById(
                                                                                member.getGroupId())
                                                                .orElse(null))
                                .filter(
                                                group -> group != null)
                                .toList();
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
                                        "Authentication is required");
                }

                if (!groupRepository
                                .existsById(
                                                groupId)) {

                        throw new RuntimeException(
                                        "Group not found");
                }

                if (!groupMemberRepository
                                .existsByGroupIdAndUserEmail(
                                                groupId,
                                                requesterEmail)) {

                        throw new RuntimeException(
                                        "You are not a member of this group");
                }
        }

        // =========================================================
        // VERIFY OWNER
        // =========================================================

        private Group getGroupAndVerifyOwner(
                        Long groupId,
                        String requesterEmail) {

                if (requesterEmail == null ||
                                requesterEmail.isBlank()) {

                        throw new RuntimeException(
                                        "Authentication is required");
                }

                Group group = groupRepository
                                .findById(
                                                groupId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Group not found"));

                if (group.getCreatedByEmail() == null ||
                                !group
                                                .getCreatedByEmail()
                                                .equalsIgnoreCase(
                                                                requesterEmail)) {

                        throw new RuntimeException(
                                        "Only the group owner can perform this action");
                }

                return group;
        }

        // =========================================================
        // ADD MEMBER
        // OWNER ONLY
        // =========================================================

        public GroupMember addMember(
                        Long groupId,
                        String memberEmail,
                        String requesterEmail) {

                Group group = getGroupAndVerifyOwner(
                                groupId,
                                requesterEmail);

                if (memberEmail == null ||
                                memberEmail.isBlank()) {

                        throw new RuntimeException(
                                        "Member email is required");
                }

                String cleanEmail = memberEmail
                                .trim()
                                .toLowerCase();

                if (!userRepository
                                .existsByEmail(
                                                cleanEmail)) {

                        throw new RuntimeException(
                                        "User does not exist");
                }

                if (groupMemberRepository
                                .existsByGroupIdAndUserEmail(
                                                group.getId(),
                                                cleanEmail)) {

                        throw new RuntimeException(
                                        "User is already a member of this group");
                }

                GroupMember member = new GroupMember();

                member.setGroupId(
                                group.getId());

                member.setUserEmail(
                                cleanEmail);

                GroupMember savedMember = groupMemberRepository.save(
                                member);

                // RECORD ACTIVITY
                activityService.recordActivity(
                                groupId,
                                requesterEmail,
                                "MEMBER_ADDED",
                                requesterEmail +
                                                " added " +
                                                cleanEmail +
                                                " to the group");

                return savedMember;
        }

        // =========================================================
        // GET MEMBERS
        // MEMBER ACCESS ONLY
        // =========================================================

        public List<GroupMember> getMembers(
                        Long groupId,
                        String requesterEmail) {

                verifyGroupMemberAccess(
                                groupId,
                                requesterEmail);

                return groupMemberRepository
                                .findByGroupId(
                                                groupId);
        }

        // =========================================================
        // UPDATE BUDGET
        // OWNER ONLY
        // =========================================================

        public Group setBudget(
                        Long groupId,
                        BigDecimal budget,
                        String requesterEmail) {

                Group group = getGroupAndVerifyOwner(
                                groupId,
                                requesterEmail);

                if (budget == null) {

                        throw new RuntimeException(
                                        "Budget is required");
                }

                if (budget.compareTo(
                                BigDecimal.ZERO) < 0) {

                        throw new RuntimeException(
                                        "Budget cannot be negative");
                }

                group.setBudget(
                                budget);

                Group savedGroup = groupRepository.save(
                                group);

                // RECORD ACTIVITY
                activityService.recordActivity(
                                groupId,
                                requesterEmail,
                                "BUDGET_UPDATED",
                                requesterEmail +
                                                " changed the group budget to RM " +
                                                budget.setScale(
                                                                2,
                                                                RoundingMode.HALF_UP));

                return savedGroup;
        }

        // =========================================================
        // REMOVE MEMBER
        // OWNER ONLY
        // =========================================================

        @Transactional
        public void removeMember(
                        Long groupId,
                        String memberEmail,
                        String requesterEmail) {

                Group group = getGroupAndVerifyOwner(
                                groupId,
                                requesterEmail);

                if (memberEmail == null ||
                                memberEmail.isBlank()) {

                        throw new RuntimeException(
                                        "Member email is required");
                }

                String cleanEmail = memberEmail
                                .trim()
                                .toLowerCase();

                if (group
                                .getCreatedByEmail()
                                .equalsIgnoreCase(
                                                cleanEmail)) {

                        throw new RuntimeException(
                                        "The group owner cannot remove themselves");
                }

                if (!groupMemberRepository
                                .existsByGroupIdAndUserEmail(
                                                groupId,
                                                cleanEmail)) {

                        throw new RuntimeException(
                                        "User is not a member of this group");
                }

                groupMemberRepository
                                .deleteByGroupIdAndUserEmail(
                                                groupId,
                                                cleanEmail);

                // RECORD ACTIVITY
                activityService.recordActivity(
                                groupId,
                                requesterEmail,
                                "MEMBER_REMOVED",
                                requesterEmail +
                                                " removed " +
                                                cleanEmail +
                                                " from the group");
        }

        // =========================================================
        // LEAVE GROUP
        // =========================================================

        @Transactional
        public void leaveGroup(
                        Long groupId,
                        String requesterEmail) {

                if (requesterEmail == null ||
                                requesterEmail.isBlank()) {

                        throw new RuntimeException(
                                        "Authentication is required");
                }

                Group group = groupRepository
                                .findById(
                                                groupId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Group not found"));

                if (group
                                .getCreatedByEmail()
                                .equalsIgnoreCase(
                                                requesterEmail)) {

                        throw new RuntimeException(
                                        "The group owner cannot leave the group");
                }

                if (!groupMemberRepository
                                .existsByGroupIdAndUserEmail(
                                                groupId,
                                                requesterEmail)) {

                        throw new RuntimeException(
                                        "You are not a member of this group");
                }

                /*
                 * Record this BEFORE removing the member.
                 */
                activityService.recordActivity(
                                groupId,
                                requesterEmail,
                                "MEMBER_LEFT",
                                requesterEmail +
                                                " left the group");

                groupMemberRepository
                                .deleteByGroupIdAndUserEmail(
                                                groupId,
                                                requesterEmail);
        }

        // =========================================================
        // DELETE GROUP
        // OWNER ONLY
        // =========================================================

        @Transactional
        public void deleteGroup(
                        Long groupId,
                        String requesterEmail) {

                Group group = getGroupAndVerifyOwner(
                                groupId,
                                requesterEmail);

                // Delete expense splits first
                List<Expense> expenses = expenseRepository
                                .findByGroupId(
                                                groupId);

                for (Expense expense : expenses) {

                        List<ExpenseSplit> splits = expenseSplitRepository
                                        .findByExpenseId(
                                                        expense.getId());

                        expenseSplitRepository
                                        .deleteAll(
                                                        splits);
                }

                expenseSplitRepository
                                .flush();

                // Delete expenses
                expenseRepository
                                .deleteAll(
                                                expenses);

                expenseRepository
                                .flush();

                // Delete payments
                List<Payment> payments = paymentRepository
                                .findByGroupId(
                                                groupId);

                paymentRepository
                                .deleteAll(
                                                payments);

                paymentRepository
                                .flush();

                /*
                 * Delete activity history too.
                 *
                 * The group is being permanently deleted,
                 * so its history should also disappear.
                 */
                activityService
                                .deleteGroupActivities(
                                                groupId);

                // Delete members
                groupMemberRepository
                                .deleteByGroupId(
                                                groupId);

                groupMemberRepository
                                .flush();

                // Finally delete group
                groupRepository
                                .delete(
                                                group);

                groupRepository
                                .flush();
        }
}