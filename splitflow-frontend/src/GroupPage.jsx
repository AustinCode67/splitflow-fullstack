import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  authFetch,
  authJsonFetch,
  getErrorMessage,
} from "./api";

import "./GroupPage.css";

function GroupPage({
  group,
  onBack,
}) {
  const userEmail =
    localStorage.getItem(
      "userEmail"
    );

  const isGroupOwner =
    group.createdByEmail?.toLowerCase() ===
    userEmail?.toLowerCase();

  // =========================================================
  // MAIN DATA
  // =========================================================

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [
    analytics,
    setAnalytics,
  ] = useState(null);

  const [
    members,
    setMembers,
  ] = useState([]);

  const [
    settlements,
    setSettlements,
  ] = useState([]);

  const [
    payments,
    setPayments,
  ] = useState([]);

  const [
    allExpenses,
    setAllExpenses,
  ] = useState([]);

  const [
    activities,
    setActivities,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  // =========================================================
  // STATUS
  // =========================================================

  const [
    status,
    setStatus,
  ] = useState(null);

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");

  const showSuccess = (
    message
  ) => {
    setStatus({
      type: "success",
      message,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const showError = (
    message
  ) => {
    setStatus({
      type: "error",
      message,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // BUDGET
  // =========================================================

  const [
    budget,
    setBudget,
  ] = useState(
    group.budget || ""
  );

  // =========================================================
  // MEMBER
  // =========================================================

  const [
    memberEmail,
    setMemberEmail,
  ] = useState("");

  // =========================================================
  // ADD EXPENSE
  // =========================================================

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("Food");

  const [
    splitType,
    setSplitType,
  ] = useState("EQUAL");

  const [
    selectedParticipants,
    setSelectedParticipants,
  ] = useState([]);

  const [
    splitValues,
    setSplitValues,
  ] = useState({});

  // =========================================================
  // EDIT EXPENSE
  // =========================================================

  const [
    editingExpenseId,
    setEditingExpenseId,
  ] = useState(null);

  const [
    editDescription,
    setEditDescription,
  ] = useState("");

  const [
    editAmount,
    setEditAmount,
  ] = useState("");

  const [
    editCategory,
    setEditCategory,
  ] = useState("Other");

  const [
    editPaidByEmail,
    setEditPaidByEmail,
  ] = useState("");

  const [
    editParticipants,
    setEditParticipants,
  ] = useState([]);

  const [
    editSplitValues,
    setEditSplitValues,
  ] = useState({});

  // =========================================================
  // SPLIT DETAILS
  // =========================================================

  const [
    expandedExpenseId,
    setExpandedExpenseId,
  ] = useState(null);

  const [
    expenseSplits,
    setExpenseSplits,
  ] = useState({});

  // =========================================================
  // PAYMENT
  // =========================================================

  const [
    paymentTo,
    setPaymentTo,
  ] = useState("");

  const [
    paymentAmount,
    setPaymentAmount,
  ] = useState("");

  // =========================================================
  // FILTERS
  // =========================================================

  const [
    expenseSearch,
    setExpenseSearch,
  ] = useState("");

  const [
    expenseCategoryFilter,
    setExpenseCategoryFilter,
  ] = useState("ALL");

  const [
    expenseSort,
    setExpenseSort,
  ] = useState("NEWEST");

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  const loadDashboard =
    async () => {
      const response =
        await authFetch(
          `/groups/${group.id}/expenses/dashboard`
        );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response
          )
        );
      }

      const data =
        await response.json();

      setDashboard(data);
    };

  // =========================================================
  // LOAD ANALYTICS
  // =========================================================

  const loadAnalytics =
    async () => {
      const response =
        await authFetch(
          `/groups/${group.id}/analytics`
        );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response
          )
        );
      }

      const data =
        await response.json();

      setAnalytics(data);
    };

  // =========================================================
  // LOAD MEMBERS
  // =========================================================

  const loadMembers =
    async () => {
      const response =
        await authFetch(
          `/groups/${group.id}/members`
        );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response
          )
        );
      }

      const data =
        await response.json();

      setMembers(data);
    };

  // =========================================================
  // LOAD SETTLEMENTS
  // =========================================================

  const loadSettlements =
    async () => {
      const response =
        await authFetch(
          `/groups/${group.id}/expenses/settlements`
        );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response
          )
        );
      }

      const data =
        await response.json();

      setSettlements(data);
    };

  // =========================================================
  // LOAD PAYMENTS
  // =========================================================

  const loadPayments =
    async () => {
      const response =
        await authFetch(
          `/groups/${group.id}/expenses/payments`
        );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response
          )
        );
      }

      const data =
        await response.json();

      setPayments(data);
    };

  // =========================================================
  // LOAD EXPENSES
  // =========================================================

  const loadExpenses =
    async () => {
      const response =
        await authFetch(
          `/groups/${group.id}/expenses`
        );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response
          )
        );
      }

      const data =
        await response.json();

      setAllExpenses(data);
    };

  // =========================================================
  // LOAD ACTIVITIES
  // =========================================================

  const loadActivities =
    async () => {
      const response =
        await authFetch(
          `/groups/${group.id}/activities`
        );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response
          )
        );
      }

      const data =
        await response.json();

      setActivities(data);
    };

  // =========================================================
  // REFRESH EVERYTHING
  // =========================================================

  const refreshEverything =
    async () => {
      await Promise.all([
        loadDashboard(),
        loadAnalytics(),
        loadMembers(),
        loadSettlements(),
        loadPayments(),
        loadExpenses(),
        loadActivities(),
      ]);
    };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const start =
      async () => {
        setLoading(true);

        try {
          await refreshEverything();
        } catch (error) {
          console.error(error);

          showError(
            error.message
          );
        } finally {
          setLoading(false);
        }
      };

    start();
  }, [group.id]);

  // =========================================================
  // UPDATE BUDGET
  // =========================================================

  const handleBudgetUpdate =
    async (e) => {
      e.preventDefault();

      setStatus(null);

      setActionLoading(
        "budget"
      );

      try {
        const response =
          await authJsonFetch(
            `/groups/${group.id}/budget`,
            {
              method: "PUT",

              body:
                JSON.stringify({
                  budget,
                }),
            }
          );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response
            )
          );
        }

        await refreshEverything();

        showSuccess(
          "Group budget updated successfully."
        );
      } catch (error) {
        showError(
          error.message
        );
      } finally {
        setActionLoading("");
      }
    };

  // =========================================================
  // ADD MEMBER
  // =========================================================

  const handleAddMember =
    async (e) => {
      e.preventDefault();

      setStatus(null);

      setActionLoading(
        "addMember"
      );

      try {
        const response =
          await authJsonFetch(
            `/groups/${group.id}/members`,
            {
              method: "POST",

              body:
                JSON.stringify({
                  email:
                    memberEmail,
                }),
            }
          );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response
            )
          );
        }

        setMemberEmail("");

        await refreshEverything();

        showSuccess(
          "Member added successfully."
        );
      } catch (error) {
        showError(
          error.message
        );
      } finally {
        setActionLoading("");
      }
    };

  // =========================================================
  // REMOVE MEMBER
  // =========================================================

  const handleRemoveMember =
    async (email) => {
      const confirmed =
        window.confirm(
          `Remove ${email} from this group?`
        );

      if (!confirmed) {
        return;
      }

      setStatus(null);

      setActionLoading(
        `remove-${email}`
      );

      try {
        const response =
          await authFetch(
            `/groups/${group.id}/members/${encodeURIComponent(
              email
            )}`,
            {
              method:
                "DELETE",
            }
          );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response
            )
          );
        }

        await refreshEverything();

        showSuccess(
          `${email} was removed from the group.`
        );
      } catch (error) {
        showError(
          error.message
        );
      } finally {
        setActionLoading("");
      }
    };

  // =========================================================
  // LEAVE GROUP
  // =========================================================

  const handleLeaveGroup =
    async () => {
      const confirmed =
        window.confirm(
          `Leave "${group.name}"?`
        );

      if (!confirmed) {
        return;
      }

      setStatus(null);

      setActionLoading(
        "leaveGroup"
      );

      try {
        const response =
          await authFetch(
            `/groups/${group.id}/leave`,
            {
              method:
                "DELETE",
            }
          );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response
            )
          );
        }

        onBack();
      } catch (error) {
        showError(
          error.message
        );

        setActionLoading("");
      }
    };

  // =========================================================
  // DELETE GROUP
  // =========================================================

  const handleDeleteGroup =
    async () => {
      if (!isGroupOwner) {
        showError(
          "Only the group owner can delete this group."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Delete "${group.name}"?\n\nThis permanently deletes all expenses, payments, members and activity history.`
        );

      if (!confirmed) {
        return;
      }

      const secondConfirmation =
        window.confirm(
          `Are you absolutely sure you want to permanently delete "${group.name}"?`
        );

      if (
        !secondConfirmation
      ) {
        return;
      }

      setStatus(null);

      setActionLoading(
        "deleteGroup"
      );

      try {
        const response =
          await authFetch(
            `/groups/${group.id}`,
            {
              method:
                "DELETE",
            }
          );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response
            )
          );
        }

        onBack();
      } catch (error) {
        showError(
          error.message
        );

        setActionLoading("");
      }
    };

  // =========================================================
  // PARTICIPANTS
  // =========================================================

  const toggleParticipant = (
    email
  ) => {
    setSelectedParticipants(
      (current) =>
        current.includes(
          email
        )
          ? current.filter(
              (item) =>
                item !== email
            )
          : [
              ...current,
              email,
            ]
    );
  };

  const handleSplitValueChange = (
    email,
    value
  ) => {
    setSplitValues(
      (current) => ({
        ...current,

        [email]:
          value,
      })
    );
  };

  // =========================================================
  // ADD EXPENSE
  // =========================================================

  const handleAddExpense =
    async (e) => {
      e.preventDefault();

      if (
        selectedParticipants.length ===
        0
      ) {
        showError(
          "Select at least one participant."
        );

        return;
      }

      let values = null;

      if (
        splitType ===
          "EXACT" ||
        splitType ===
          "PERCENTAGE"
      ) {
        values = {};

        selectedParticipants.forEach(
          (email) => {
            values[email] =
              Number(
                splitValues[
                  email
                ] || 0
              );
          }
        );
      }

      setStatus(null);

      setActionLoading(
        "addExpense"
      );

      try {
        const response =
          await authJsonFetch(
            `/groups/${group.id}/expenses`,
            {
              method:
                "POST",

              body:
                JSON.stringify(
                  {
                    description,

                    amount:
                      Number(
                        amount
                      ),

                    category,

                    participants:
                      selectedParticipants,

                    splitType,

                    splitValues:
                      values,
                  }
                ),
            }
          );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response
            )
          );
        }

        setDescription("");
        setAmount("");
        setCategory("Food");
        setSplitType("EQUAL");

        setSelectedParticipants(
          []
        );

        setSplitValues({});

        await refreshEverything();

        showSuccess(
          "Expense added successfully."
        );
      } catch (error) {
        showError(
          error.message
        );
      } finally {
        setActionLoading("");
      }
    };

  // =========================================================
  // VIEW SPLITS
  // =========================================================

  const handleToggleSplits =
    async (
      expenseId
    ) => {
      if (
        expandedExpenseId ===
        expenseId
      ) {
        setExpandedExpenseId(
          null
        );

        return;
      }

      try {
        if (
          !expenseSplits[
            expenseId
          ]
        ) {
          const response =
            await authFetch(
              `/groups/${group.id}/expenses/${expenseId}/splits`
            );

          if (
            !response.ok
          ) {
            throw new Error(
              await getErrorMessage(
                response
              )
            );
          }

          const data =
            await response.json();

          setExpenseSplits(
            (current) => ({
              ...current,

              [expenseId]:
                data,
            })
          );
        }

        setExpandedExpenseId(
          expenseId
        );
      } catch (error) {
        showError(
          error.message
        );
      }
    };

  // =========================================================
  // START EDIT
  // =========================================================

  const handleStartEdit =
    async (
      expense
    ) => {
      setStatus(null);

      try {
        const response =
          await authFetch(
            `/groups/${group.id}/expenses/${expense.id}/splits`
          );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response
            )
          );
        }

        const splits =
          await response.json();

        const values = {};

        const participants =
          [];

        splits.forEach(
          (split) => {
            participants.push(
              split.userEmail
            );

            values[
              split.userEmail
            ] =
              split.amountOwed;
          }
        );

        setEditingExpenseId(
          expense.id
        );

        setEditDescription(
          expense.description
        );

        setEditAmount(
          expense.amount
        );

        setEditCategory(
          expense.category ||
            "Other"
        );

        setEditPaidByEmail(
          expense.paidByEmail
        );

        setEditParticipants(
          participants
        );

        setEditSplitValues(
          values
        );
      } catch (error) {
        showError(
          error.message
        );
      }
    };

  // =========================================================
  // SAVE EDIT
  // =========================================================

  const handleSaveEdit =
    async (
      expenseId
    ) => {
      const values = {};

      editParticipants.forEach(
        (email) => {
          values[email] =
            Number(
              editSplitValues[
                email
              ] || 0
            );
        }
      );

      setStatus(null);

      setActionLoading(
        `edit-${expenseId}`
      );

      try {
        const response =
          await authJsonFetch(
            `/groups/${group.id}/expenses/${expenseId}`,
            {
              method:
                "PUT",

              body:
                JSON.stringify(
                  {
                    description:
                      editDescription,

                    amount:
                      Number(
                        editAmount
                      ),

                    paidByEmail:
                      editPaidByEmail,

                    category:
                      editCategory,

                    participants:
                      editParticipants,

                    splitType:
                      "EXACT",

                    splitValues:
                      values,
                  }
                ),
            }
          );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response
            )
          );
        }

        setEditingExpenseId(
          null
        );

        await refreshEverything();

        showSuccess(
          "Expense updated successfully."
        );
      } catch (error) {
        showError(
          error.message
        );
      } finally {
        setActionLoading("");
      }
    };

  // =========================================================
  // DELETE EXPENSE
  // =========================================================

  const handleDeleteExpense =
    async (
      expenseId
    ) => {
      const confirmed =
        window.confirm(
          "Delete this expense?"
        );

      if (!confirmed) {
        return;
      }

      setStatus(null);

      setActionLoading(
        `delete-${expenseId}`
      );

      try {
        const response =
          await authFetch(
            `/groups/${group.id}/expenses/${expenseId}`,
            {
              method:
                "DELETE",
            }
          );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response
            )
          );
        }

        await refreshEverything();

        showSuccess(
          "Expense deleted successfully."
        );
      } catch (error) {
        showError(
          error.message
        );
      } finally {
        setActionLoading("");
      }
    };

  // =========================================================
  // SETTLEMENTS FOR CURRENT USER
  // =========================================================

  const mySettlements =
    useMemo(
      () =>
        settlements.filter(
          (
            settlement
          ) =>
            settlement.fromUser
              ?.toLowerCase() ===
            userEmail?.toLowerCase()
        ),

      [
        settlements,
        userEmail,
      ]
    );

  const selectedSettlement =
    mySettlements.find(
      (
        settlement
      ) =>
        settlement.toUser ===
        paymentTo
    );

  // =========================================================
  // PAYMENT PERSON
  // =========================================================

  const handlePaymentPersonChange = (
    e
  ) => {
    const selectedEmail =
      e.target.value;

    setPaymentTo(
      selectedEmail
    );

    const settlement =
      mySettlements.find(
        (item) =>
          item.toUser ===
          selectedEmail
      );

    if (settlement) {
      setPaymentAmount(
        Number(
          settlement.amount
        ).toFixed(2)
      );
    } else {
      setPaymentAmount("");
    }
  };

  // =========================================================
  // FULL SETTLEMENT
  // =========================================================

  const handleSettleFullAmount =
    () => {
      if (
        !selectedSettlement
      ) {
        return;
      }

      setPaymentAmount(
        Number(
          selectedSettlement.amount
        ).toFixed(2)
      );
    };

  // =========================================================
  // RECORD PAYMENT
  // =========================================================

  const handleSettleUp =
    async (e) => {
      e.preventDefault();

      if (
        !selectedSettlement
      ) {
        showError(
          "Please select someone you owe."
        );

        return;
      }

      const enteredAmount =
        Number(
          paymentAmount
        );

      const maximumAmount =
        Number(
          selectedSettlement.amount
        );

      if (
        !enteredAmount ||
        enteredAmount <= 0
      ) {
        showError(
          "Enter a valid payment amount."
        );

        return;
      }

      if (
        enteredAmount >
        maximumAmount
      ) {
        showError(
          `You can only pay up to RM ${maximumAmount.toFixed(
            2
          )}.`
        );

        return;
      }

      setStatus(null);

      setActionLoading(
        "payment"
      );

      try {
        const response =
          await authJsonFetch(
            `/groups/${group.id}/expenses/payments`,
            {
              method:
                "POST",

              body:
                JSON.stringify(
                  {
                    toUser:
                      paymentTo,

                    amount:
                      enteredAmount,
                  }
                ),
            }
          );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response
            )
          );
        }

        setPaymentTo("");
        setPaymentAmount("");

        await refreshEverything();

        showSuccess(
          "Payment recorded successfully."
        );
      } catch (error) {
        showError(
          error.message
        );
      } finally {
        setActionLoading("");
      }
    };

  // =========================================================
  // FILTER EXPENSES
  // =========================================================

  const filteredExpenses =
    allExpenses
      .slice()

      .filter(
        (expense) => {
          const matchesSearch =
            expense.description
              ?.toLowerCase()
              .includes(
                expenseSearch
                  .trim()
                  .toLowerCase()
              );

          const matchesCategory =
            expenseCategoryFilter ===
              "ALL" ||
            expense.category ===
              expenseCategoryFilter;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      )

      .sort(
        (a, b) => {
          if (
            expenseSort ===
            "OLDEST"
          ) {
            return (
              a.id - b.id
            );
          }

          if (
            expenseSort ===
            "HIGHEST"
          ) {
            return (
              Number(
                b.amount
              ) -
              Number(
                a.amount
              )
            );
          }

          if (
            expenseSort ===
            "LOWEST"
          ) {
            return (
              Number(
                a.amount
              ) -
              Number(
                b.amount
              )
            );
          }

          return (
            b.id - a.id
          );
        }
      );

  // =========================================================
  // ACTIVITY ICON
  // =========================================================

  const getActivityIcon = (
    actionType
  ) => {
    switch (
      actionType
    ) {
      case "GROUP_CREATED":
        return "🎉";

      case "MEMBER_ADDED":
        return "👤";

      case "MEMBER_REMOVED":
        return "🚪";

      case "MEMBER_LEFT":
        return "🚶";

      case "BUDGET_UPDATED":
        return "📊";

      case "EXPENSE_CREATED":
        return "💰";

      case "EXPENSE_UPDATED":
        return "✏️";

      case "EXPENSE_DELETED":
        return "🗑️";

      case "PAYMENT_RECORDED":
        return "💳";

      default:
        return "•";
    }
  };

  // =========================================================
  // FORMAT ACTIVITY DATE
  // =========================================================

  const formatActivityDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "";
    }

    const date =
      new Date(
        dateValue
      );

    return date.toLocaleString(
      "en-MY",
      {
        day:
          "2-digit",

        month:
          "short",

        year:
          "numeric",

        hour:
          "2-digit",

        minute:
          "2-digit",
      }
    );
  };

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Entertainment",
    "Accommodation",
    "Utilities",
    "Travel",
    "Other",
  ];

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="group-page">

        <button
          className="back-btn"
          onClick={
            onBack
          }
        >
          ← Back
        </button>

        <div className="page-loading">

          <div className="loading-spinner" />

          <p>
            Loading group...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD VALUES
  // =========================================================

  const budgetSummary =
    dashboard?.budgetSummary ||
    {};

  const categorySummary =
    dashboard?.categorySummary ||
    {};

  const balances =
    dashboard?.balances ||
    {};

  const myBalance =
    Number(
      balances[
        userEmail
      ] || 0
    );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="group-page">

      {/* STATUS */}

      {status && (
        <div
          className={`status-banner ${status.type}`}
        >
          <div className="status-content">

            <span className="status-icon">
              {status.type ===
              "success"
                ? "✓"
                : "!"}
            </span>

            <span>
              {
                status.message
              }
            </span>

          </div>

          <button
            className="status-close"
            onClick={() =>
              setStatus(
                null
              )
            }
          >
            ×
          </button>
        </div>
      )}

      {/* HEADER */}

      <div className="group-topbar">

        <div>
          <button
            className="back-btn"
            onClick={
              onBack
            }
          >
            ← Back
          </button>

          <h1>
            {group.name}
          </h1>

          <p className="group-subtitle">
            {isGroupOwner
              ? "You are the group owner"
              : "Group member"}
          </p>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="summary-grid">

        <div className="summary-card">

          <span>
            Budget
          </span>

          <strong>
            RM{" "}
            {Number(
              budgetSummary.budget ||
                0
            ).toFixed(2)}
          </strong>

        </div>

        <div className="summary-card">

          <span>
            Total Spent
          </span>

          <strong>
            RM{" "}
            {Number(
              budgetSummary.spent ||
                0
            ).toFixed(2)}
          </strong>

        </div>

        <div className="summary-card">

          <span>
            Remaining
          </span>

          <strong>
            RM{" "}
            {Number(
              budgetSummary.remaining ||
                0
            ).toFixed(2)}
          </strong>

        </div>

        <div className="summary-card">

          <span>
            Your Balance
          </span>

          <strong>
            RM{" "}
            {Math.abs(
              myBalance
            ).toFixed(2)}
          </strong>

          <small>
            {myBalance > 0
              ? "You are owed money"
              : myBalance < 0
                ? "You owe money"
                : "All settled"}
          </small>

        </div>

      </div>

      {/* ANALYTICS */}

      <div className="section-card">

        <div className="analytics-title-row">

          <div>
            <h2>
              Analytics
            </h2>

            <p className="analytics-subtitle">
              A quick overview of this group's spending activity.
            </p>
          </div>

        </div>

        <div className="analytics-grid">

          <div className="analytics-card">

            <span>
              Total Expenses
            </span>

            <strong>
              {analytics?.totalExpenses ||
                0}
            </strong>

          </div>

          <div className="analytics-card">

            <span>
              Average Expense
            </span>

            <strong>
              RM{" "}
              {Number(
                analytics?.averageExpense ||
                  0
              ).toFixed(2)}
            </strong>

          </div>

          <div className="analytics-card">

            <span>
              Largest Expense
            </span>

            <strong>
              RM{" "}
              {Number(
                analytics?.largestExpense ||
                  0
              ).toFixed(2)}
            </strong>

            <small>
              {analytics?.largestExpenseDescription ||
                "None"}
            </small>

          </div>

          <div className="analytics-card">

            <span>
              Top Payer
            </span>

            <strong>
              RM{" "}
              {Number(
                analytics?.topPayerAmount ||
                  0
              ).toFixed(2)}
            </strong>

            <small>
              {analytics?.topPayerEmail ||
                "None"}
            </small>

          </div>

        </div>
      </div>

      {/* BUDGET */}

      <div className="section-card">

        <h2>
          Group Budget
        </h2>

        <div className="budget-progress">

          <div
            className="budget-progress-fill"
            style={{
              width: `${Math.min(
                Number(
                  budgetSummary.percentageUsed ||
                    0
                ),
                100
              )}%`,
            }}
          />

        </div>

        <p>
          {Number(
            budgetSummary.percentageUsed ||
              0
          ).toFixed(1)}
          % used
        </p>

        {isGroupOwner && (

          <form
            className="inline-form"
            onSubmit={
              handleBudgetUpdate
            }
          >

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                budget
              }
              placeholder="Group budget"
              onChange={(e) =>
                setBudget(
                  e.target.value
                )
              }
            />

            <button
              className="primary-btn"
              disabled={
                actionLoading ===
                "budget"
              }
            >
              {actionLoading ===
              "budget"
                ? "Updating..."
                : "Update Budget"}
            </button>

          </form>
        )}

      </div>

      {/* MEMBERS */}

      <div className="section-card">

        <h2>
          Members
        </h2>

        <div className="member-list">

          {members.map(
            (
              member
            ) => {
              const isOwnerMember =
                member.userEmail
                  ?.toLowerCase() ===
                group.createdByEmail
                  ?.toLowerCase();

              return (
                <div
                  className="member-row"
                  key={
                    member.id
                  }
                >

                  <div>

                    <strong>
                      {
                        member.userEmail
                      }
                    </strong>

                    {isOwnerMember && (
                      <span className="owner-badge">
                        Owner
                      </span>
                    )}

                  </div>

                  {isGroupOwner &&
                    !isOwnerMember && (

                      <button
                        className="danger-outline-btn"
                        disabled={
                          actionLoading ===
                          `remove-${member.userEmail}`
                        }
                        onClick={() =>
                          handleRemoveMember(
                            member.userEmail
                          )
                        }
                      >
                        {actionLoading ===
                        `remove-${member.userEmail}`
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    )}

                </div>
              );
            }
          )}

        </div>

        {isGroupOwner && (

          <form
            className="inline-form member-form"
            onSubmit={
              handleAddMember
            }
          >

            <input
              type="email"
              required
              value={
                memberEmail
              }
              placeholder="Member email"
              onChange={(e) =>
                setMemberEmail(
                  e.target.value
                )
              }
            />

            <button
              className="primary-btn"
              disabled={
                actionLoading ===
                "addMember"
              }
            >
              {actionLoading ===
              "addMember"
                ? "Adding..."
                : "Add Member"}
            </button>

          </form>
        )}

        {!isGroupOwner && (

          <button
            className="danger-outline-btn leave-btn"
            disabled={
              actionLoading ===
              "leaveGroup"
            }
            onClick={
              handleLeaveGroup
            }
          >
            {actionLoading ===
            "leaveGroup"
              ? "Leaving..."
              : "Leave Group"}
          </button>
        )}

      </div>

      {/* ADD EXPENSE */}

      <div className="section-card">

        <h2>
          Add Expense
        </h2>

        <form
          className="form-column"
          onSubmit={
            handleAddExpense
          }
        >

          <input
            type="text"
            required
            value={
              description
            }
            placeholder="Description"
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={
              amount
            }
            placeholder="Amount"
            onChange={(e) =>
              setAmount(
                e.target.value
              )
            }
          />

          <select
            value={
              category
            }
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          >

            {categories.map(
              (
                item
              ) => (

                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {item}
                </option>

              )
            )}

          </select>

          <select
            value={
              splitType
            }
            onChange={(e) => {
              setSplitType(
                e.target.value
              );

              setSplitValues(
                {}
              );
            }}
          >

            <option value="EQUAL">
              Equal Split
            </option>

            <option value="EXACT">
              Exact Amount
            </option>

            <option value="PERCENTAGE">
              Percentage
            </option>

          </select>

          <h3>
            Participants
          </h3>

          <div className="participant-list">

            {members.map(
              (
                member
              ) => (

                <label
                  key={
                    member.userEmail
                  }
                  className="participant-row"
                >

                  <input
                    type="checkbox"
                    checked={
                      selectedParticipants.includes(
                        member.userEmail
                      )
                    }
                    onChange={() =>
                      toggleParticipant(
                        member.userEmail
                      )
                    }
                  />

                  <span>
                    {
                      member.userEmail
                    }
                  </span>

                </label>

              )
            )}

          </div>

          {(splitType ===
            "EXACT" ||
            splitType ===
              "PERCENTAGE") &&

            selectedParticipants.map(
              (
                email
              ) => (

                <div
                  className="split-input-row"
                  key={
                    email
                  }
                >

                  <span>
                    {email}
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder={
                      splitType ===
                      "EXACT"
                        ? "RM"
                        : "%"
                    }
                    value={
                      splitValues[
                        email
                      ] || ""
                    }
                    onChange={(e) =>
                      handleSplitValueChange(
                        email,
                        e.target.value
                      )
                    }
                  />

                </div>

              )
            )}

          <button
            className="primary-btn"
            disabled={
              actionLoading ===
              "addExpense"
            }
          >
            {actionLoading ===
            "addExpense"
              ? "Adding Expense..."
              : "Add Expense"}
          </button>

        </form>

      </div>

      {/* RECOMMENDED SETTLEMENTS */}

      <div className="section-card">

        <h2>
          Recommended Settlements
        </h2>

        {settlements.length ===
        0 ? (

          <p>
            Everyone is settled up 🎉
          </p>

        ) : (

          <div className="settlement-list">

            {settlements.map(
              (
                settlement,
                index
              ) => (

                <div
                  className="settlement-row"
                  key={
                    index
                  }
                >

                  <div>

                    <strong>
                      {
                        settlement.fromUser
                      }
                    </strong>

                    <span>
                      {" "}
                      pays{" "}
                    </span>

                    <strong>
                      {
                        settlement.toUser
                      }
                    </strong>

                  </div>

                  <strong>
                    RM{" "}
                    {Number(
                      settlement.amount
                    ).toFixed(2)}
                  </strong>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* SETTLE UP */}

      <div className="section-card">

        <h2>
          Settle Up
        </h2>

        {mySettlements.length ===
        0 ? (

          <p>
            You do not currently owe anyone 🎉
          </p>

        ) : (

          <form
            className="form-column"
            onSubmit={
              handleSettleUp
            }
          >

            <select
              required
              value={
                paymentTo
              }
              onChange={
                handlePaymentPersonChange
              }
            >

              <option value="">
                Select person you owe
              </option>

              {mySettlements.map(
                (
                  settlement,
                  index
                ) => (

                  <option
                    key={
                      index
                    }
                    value={
                      settlement.toUser
                    }
                  >
                    {
                      settlement.toUser
                    }{" "}
                    — RM{" "}
                    {Number(
                      settlement.amount
                    ).toFixed(2)}
                  </option>

                )
              )}

            </select>

            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={
                paymentAmount
              }
              max={
                selectedSettlement
                  ? Number(
                      selectedSettlement.amount
                    )
                  : ""
              }
              placeholder="Payment amount"
              onChange={(e) =>
                setPaymentAmount(
                  e.target.value
                )
              }
            />

            {selectedSettlement && (

              <div className="settle-helper-row">

                <small className="payment-limit-text">
                  Maximum payment: RM{" "}
                  {Number(
                    selectedSettlement.amount
                  ).toFixed(2)}
                </small>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={
                    handleSettleFullAmount
                  }
                >
                  Settle Full Amount
                </button>

              </div>

            )}

            <button
              className="primary-btn"
              type="submit"
              disabled={
                actionLoading ===
                "payment"
              }
            >
              {actionLoading ===
              "payment"
                ? "Recording..."
                : "Record Payment"}
            </button>

          </form>

        )}

      </div>

      {/* PAYMENT HISTORY */}

      <div className="section-card">

        <h2>
          Payment History
        </h2>

        {payments.length ===
        0 ? (

          <p>
            No payments recorded yet.
          </p>

        ) : (

          <div className="payment-list">

            {payments
              .slice()
              .reverse()
              .map(
                (
                  payment
                ) => (

                  <div
                    className="payment-row"
                    key={
                      payment.id
                    }
                  >

                    <div>

                      <strong>
                        {
                          payment.fromUser
                        }
                      </strong>

                      <span>
                        {" "}
                        paid{" "}
                      </span>

                      <strong>
                        {
                          payment.toUser
                        }
                      </strong>

                    </div>

                    <strong>
                      RM{" "}
                      {Number(
                        payment.amount
                      ).toFixed(2)}
                    </strong>

                  </div>

                )
              )}

          </div>

        )}

      </div>

      {/* ACTIVITY HISTORY */}

      <div className="section-card">

        <div className="activity-title-row">

          <div>

            <h2>
              Activity History
            </h2>

            <p className="activity-subtitle">
              Recent changes and transactions in this group.
            </p>

          </div>

          <span className="activity-count">

            {activities.length}{" "}

            {activities.length ===
            1
              ? "activity"
              : "activities"}

          </span>

        </div>

        {activities.length ===
        0 ? (

          <div className="activity-empty">

            <span className="activity-empty-icon">
              🕘
            </span>

            <p>
              No activity recorded yet.
            </p>

          </div>

        ) : (

          <div className="activity-timeline">

            {activities.map(
              (
                activity
              ) => (

                <div
                  className="activity-item"
                  key={
                    activity.id
                  }
                >

                  <div className="activity-icon">

                    {getActivityIcon(
                      activity.actionType
                    )}

                  </div>

                  <div className="activity-content">

                    <p className="activity-message">

                      {
                        activity.message
                      }

                    </p>

                    <div className="activity-meta">

                      <span>
                        {
                          activity.actorEmail
                        }
                      </span>

                      <span>
                        •
                      </span>

                      <span>

                        {formatActivityDate(
                          activity.createdAt
                        )}

                      </span>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* CATEGORY */}

      <div className="section-card">

        <h2>
          Spending by Category
        </h2>

        {Object.keys(
          categorySummary
        ).length === 0 ? (

          <p>
            No spending data yet.
          </p>

        ) : (

          <div className="category-list">

            {Object.entries(
              categorySummary
            ).map(
              ([
                name,
                value,
              ]) => {

                const total =
                  Number(
                    budgetSummary.spent ||
                      0
                  );

                const percentage =
                  total > 0
                    ? (Number(
                        value
                      ) /
                        total) *
                      100
                    : 0;

                return (
                  <div
                    className="category-item"
                    key={
                      name
                    }
                  >

                    <div className="category-header">

                      <span>
                        {name}
                      </span>

                      <strong>
                        RM{" "}
                        {Number(
                          value
                        ).toFixed(2)}
                      </strong>

                    </div>

                    <div className="category-bar">

                      <div
                        className="category-bar-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

      {/* BALANCES */}

      <div className="section-card">

        <h2>
          Balances
        </h2>

        <div className="balance-list">

          {members.map(
            (
              member
            ) => {

              const value =
                Number(
                  balances[
                    member.userEmail
                  ] || 0
                );

              return (
                <div
                  className="balance-row"
                  key={
                    member.userEmail
                  }
                >

                  <span>
                    {
                      member.userEmail
                    }
                  </span>

                  <strong
                    className={
                      value > 0
                        ? "positive-balance"
                        : value < 0
                          ? "negative-balance"
                          : ""
                    }
                  >

                    {value > 0
                      ? "+"
                      : ""}

                    RM{" "}

                    {value.toFixed(
                      2
                    )}

                  </strong>

                </div>
              );
            }
          )}

        </div>

      </div>

      {/* ALL EXPENSES */}

      <div className="section-card">

        <h2>
          All Expenses
        </h2>

        <div className="expense-filter-row">

          <input
            type="text"
            value={
              expenseSearch
            }
            placeholder="Search expenses..."
            onChange={(e) =>
              setExpenseSearch(
                e.target.value
              )
            }
          />

          <select
            value={
              expenseCategoryFilter
            }
            onChange={(e) =>
              setExpenseCategoryFilter(
                e.target.value
              )
            }
          >

            <option value="ALL">
              All Categories
            </option>

            {categories.map(
              (
                item
              ) => (

                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {item}
                </option>

              )
            )}

          </select>

          <select
            value={
              expenseSort
            }
            onChange={(e) =>
              setExpenseSort(
                e.target.value
              )
            }
          >

            <option value="NEWEST">
              Newest
            </option>

            <option value="OLDEST">
              Oldest
            </option>

            <option value="HIGHEST">
              Highest Amount
            </option>

            <option value="LOWEST">
              Lowest Amount
            </option>

          </select>

        </div>

        {filteredExpenses.length ===
        0 ? (

          <p>
            No expenses found.
          </p>

        ) : (

          <div className="expense-list">

            {filteredExpenses.map(
              (
                expense
              ) => {

                const canModifyExpense =
                  isGroupOwner ||
                  expense.paidByEmail
                    ?.toLowerCase() ===
                    userEmail?.toLowerCase();

                const isEditing =
                  editingExpenseId ===
                  expense.id;

                return (
                  <div
                    className="expense-card"
                    key={
                      expense.id
                    }
                  >

                    {isEditing ? (

                      <>

                        <input
                          type="text"
                          value={
                            editDescription
                          }
                          onChange={(e) =>
                            setEditDescription(
                              e.target.value
                            )
                          }
                        />

                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={
                            editAmount
                          }
                          onChange={(e) =>
                            setEditAmount(
                              e.target.value
                            )
                          }
                        />

                        <select
                          value={
                            editCategory
                          }
                          onChange={(e) =>
                            setEditCategory(
                              e.target.value
                            )
                          }
                        >

                          {categories.map(
                            (
                              item
                            ) => (

                              <option
                                key={
                                  item
                                }
                                value={
                                  item
                                }
                              >
                                {item}
                              </option>

                            )
                          )}

                        </select>

                        <h4>
                          Exact Splits
                        </h4>

                        {editParticipants.map(
                          (
                            email
                          ) => (

                            <div
                              className="split-input-row"
                              key={
                                email
                              }
                            >

                              <span>
                                {email}
                              </span>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  editSplitValues[
                                    email
                                  ] || ""
                                }
                                onChange={(e) =>
                                  setEditSplitValues(
                                    (
                                      current
                                    ) => ({
                                      ...current,

                                      [email]:
                                        e
                                          .target
                                          .value,
                                    })
                                  )
                                }
                              />

                            </div>

                          )
                        )}

                        <div className="expense-actions">

                          <button
                            className="primary-btn"
                            disabled={
                              actionLoading ===
                              `edit-${expense.id}`
                            }
                            onClick={() =>
                              handleSaveEdit(
                                expense.id
                              )
                            }
                          >
                            {actionLoading ===
                            `edit-${expense.id}`
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            className="secondary-btn"
                            disabled={
                              actionLoading ===
                              `edit-${expense.id}`
                            }
                            onClick={() =>
                              setEditingExpenseId(
                                null
                              )
                            }
                          >
                            Cancel
                          </button>

                        </div>

                      </>

                    ) : (

                      <>

                        <div className="expense-main-row">

                          <div>

                            <h3>
                              {
                                expense.description
                              }
                            </h3>

                            <p>
                              Paid by{" "}
                              {
                                expense.paidByEmail
                              }
                            </p>

                            <span className="category-badge">

                              {expense.category ||
                                "Other"}

                            </span>

                          </div>

                          <strong className="expense-amount">

                            RM{" "}

                            {Number(
                              expense.amount
                            ).toFixed(
                              2
                            )}

                          </strong>

                        </div>

                        <button
                          className="split-details-btn"
                          onClick={() =>
                            handleToggleSplits(
                              expense.id
                            )
                          }
                        >

                          {expandedExpenseId ===
                          expense.id
                            ? "Hide Split Details"
                            : "View Split Details"}

                        </button>

                        {expandedExpenseId ===
                          expense.id && (

                          <div className="split-details">

                            {expenseSplits[
                              expense.id
                            ]?.map(
                              (
                                split
                              ) => (

                                <div
                                  className="split-detail-row"
                                  key={
                                    split.id
                                  }
                                >

                                  <span>
                                    {
                                      split.userEmail
                                    }
                                  </span>

                                  <strong>

                                    RM{" "}

                                    {Number(
                                      split.amountOwed
                                    ).toFixed(
                                      2
                                    )}

                                  </strong>

                                </div>

                              )
                            )}

                          </div>

                        )}

                        {canModifyExpense ? (

                          <div className="expense-actions">

                            <button
                              className="edit-btn"
                              disabled={
                                actionLoading !==
                                ""
                              }
                              onClick={() =>
                                handleStartEdit(
                                  expense
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              disabled={
                                actionLoading ===
                                `delete-${expense.id}`
                              }
                              onClick={() =>
                                handleDeleteExpense(
                                  expense.id
                                )
                              }
                            >

                              {actionLoading ===
                              `delete-${expense.id}`
                                ? "Deleting..."
                                : "Delete"}

                            </button>

                          </div>

                        ) : (

                          <p className="expense-readonly-text">
                            Only the group owner or payer can edit this expense.
                          </p>

                        )}

                      </>

                    )}

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

      {/* DANGER ZONE */}

      {isGroupOwner && (

        <div className="section-card danger-zone">

          <h2>
            Danger Zone
          </h2>

          <p>
            Deleting this group permanently removes its expenses, payments, members and activity history.
          </p>

          <button
            className="delete-group-btn"
            disabled={
              actionLoading ===
              "deleteGroup"
            }
            onClick={
              handleDeleteGroup
            }
          >

            {actionLoading ===
            "deleteGroup"
              ? "Deleting Group..."
              : "Delete Group"}

          </button>

        </div>

      )}

    </div>
  );
}

export default GroupPage;