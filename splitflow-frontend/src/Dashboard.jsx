import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import GroupPage from "./GroupPage";

import {
  authFetch,
  authJsonFetch,
  getErrorMessage,
  logoutUser,
} from "./api";

import "./Dashboard.css";

function Dashboard() {
  const userName =
    localStorage.getItem("userName");

  const userEmail =
    localStorage.getItem("userEmail");

  // =========================================================
  // MAIN STATE
  // =========================================================

  const [groups, setGroups] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedGroup, setSelectedGroup] =
    useState(null);

  const [newGroupName, setNewGroupName] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [status, setStatus] =
    useState(null);

  // =========================================================
  // MONTHLY SPENDING
  // =========================================================

  const [
    monthlySpending,
    setMonthlySpending,
  ] = useState(0);

  const [
    loadingMonthlySpending,
    setLoadingMonthlySpending,
  ] = useState(false);

  // =========================================================
  // BALANCE SUMMARY
  // =========================================================

  const [
    totalYouOwe,
    setTotalYouOwe,
  ] = useState(0);

  const [
    totalYouAreOwed,
    setTotalYouAreOwed,
  ] = useState(0);

  const [
    loadingBalances,
    setLoadingBalances,
  ] = useState(false);

  // =========================================================
  // RECENT ACTIVITY
  // =========================================================

  const [
    recentActivities,
    setRecentActivities,
  ] = useState([]);

  const [
    loadingActivities,
    setLoadingActivities,
  ] = useState(false);

  // =========================================================
  // ACCOUNT SWITCHER
  // =========================================================

  const [
    showAccountMenu,
    setShowAccountMenu,
  ] = useState(false);

  const [
    devUsers,
    setDevUsers,
  ] = useState([]);

  const [
    loadingDevUsers,
    setLoadingDevUsers,
  ] = useState(false);

  const [
    switchingAccount,
    setSwitchingAccount,
  ] = useState("");

  const accountMenuRef =
    useRef(null);

  // =========================================================
  // STATUS
  // =========================================================

  const showSuccess = (message) => {
    setStatus({
      type: "success",
      message,
    });
  };

  const showError = (message) => {
    setStatus({
      type: "error",
      message,
    });
  };

  // =========================================================
  // LOAD MONTHLY SPENDING
  // =========================================================

  const loadMonthlySpending =
    async (groupList) => {
      if (
        !groupList ||
        groupList.length === 0
      ) {
        setMonthlySpending(0);
        return;
      }

      setLoadingMonthlySpending(true);

      try {
        const now = new Date();

        const currentMonth =
          now.getMonth();

        const currentYear =
          now.getFullYear();

        const expenseRequests =
          groupList.map(
            async (group) => {
              try {
                const response =
                  await authFetch(
                    `/groups/${group.id}/expenses`
                  );

                if (!response.ok) {
                  return [];
                }

                return await response.json();
              } catch (error) {
                console.error(
                  `Failed to load expenses for group ${group.id}:`,
                  error
                );

                return [];
              }
            }
          );

        const expenseLists =
          await Promise.all(
            expenseRequests
          );

        let total = 0;

        expenseLists.forEach(
          (expenses) => {
            expenses.forEach(
              (expense) => {
                if (!expense.createdAt) {
                  return;
                }

                const expenseDate =
                  new Date(
                    expense.createdAt
                  );

                if (
                  Number.isNaN(
                    expenseDate.getTime()
                  )
                ) {
                  return;
                }

                const isThisMonth =
                  expenseDate.getMonth() ===
                    currentMonth &&
                  expenseDate.getFullYear() ===
                    currentYear;

                if (isThisMonth) {
                  total += Number(
                    expense.amount || 0
                  );
                }
              }
            );
          }
        );

        setMonthlySpending(total);
      } catch (error) {
        console.error(
          "Failed to calculate monthly spending:",
          error
        );

        setMonthlySpending(0);
      } finally {
        setLoadingMonthlySpending(
          false
        );
      }
    };

  // =========================================================
  // LOAD BALANCE SUMMARY
  // =========================================================

  const loadBalanceSummary =
    async (groupList) => {
      if (
        !groupList ||
        groupList.length === 0
      ) {
        setTotalYouOwe(0);
        setTotalYouAreOwed(0);
        return;
      }

      setLoadingBalances(true);

      try {
        const balanceRequests =
          groupList.map(
            async (group) => {
              try {
                const response =
                  await authFetch(
                    `/groups/${group.id}/balances`
                  );

                if (!response.ok) {
                  return 0;
                }

                const balances =
                  await response.json();

                const matchingEntry =
                  Object.entries(
                    balances
                  ).find(
                    ([email]) =>
                      email.toLowerCase() ===
                      userEmail?.toLowerCase()
                  );

                if (!matchingEntry) {
                  return 0;
                }

                return Number(
                  matchingEntry[1] || 0
                );
              } catch (error) {
                console.error(
                  `Failed to load balances for group ${group.id}:`,
                  error
                );

                return 0;
              }
            }
          );

        const userBalances =
          await Promise.all(
            balanceRequests
          );

        let owe = 0;
        let owed = 0;

        userBalances.forEach(
          (balance) => {
            if (balance < 0) {
              owe += Math.abs(
                balance
              );
            }

            if (balance > 0) {
              owed += balance;
            }
          }
        );

        setTotalYouOwe(owe);
        setTotalYouAreOwed(owed);
      } catch (error) {
        console.error(
          "Failed to load balance summary:",
          error
        );

        setTotalYouOwe(0);
        setTotalYouAreOwed(0);
      } finally {
        setLoadingBalances(false);
      }
    };

  // =========================================================
  // LOAD RECENT ACTIVITY
  // =========================================================

  const loadRecentActivities =
    async (groupList) => {
      if (
        !groupList ||
        groupList.length === 0
      ) {
        setRecentActivities([]);
        return;
      }

      setLoadingActivities(true);

      try {
        const activityRequests =
          groupList.map(
            async (group) => {
              try {
                const response =
                  await authFetch(
                    `/groups/${group.id}/activities`
                  );

                if (!response.ok) {
                  return [];
                }

                const activities =
                  await response.json();

                return activities.map(
                  (activity) => ({
                    ...activity,
                    groupName:
                      group.name,
                  })
                );
              } catch (error) {
                console.error(
                  `Failed to load activities for group ${group.id}:`,
                  error
                );

                return [];
              }
            }
          );

        const activityLists =
          await Promise.all(
            activityRequests
          );

        const allActivities =
          activityLists.flat();

        allActivities.sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );

        setRecentActivities(
          allActivities.slice(
            0,
            6
          )
        );
      } catch (error) {
        console.error(
          "Failed to load recent activities:",
          error
        );

        setRecentActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

  // =========================================================
  // LOAD GROUPS
  // =========================================================

  const loadGroups =
    async () => {
      try {
        const response =
          await authFetch(
            "/groups"
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

        setGroups(data);

        await Promise.all([
          loadMonthlySpending(
            data
          ),
          loadBalanceSummary(
            data
          ),
          loadRecentActivities(
            data
          ),
        ]);
      } catch (error) {
        console.error(error);

        showError(
          error.message
        );
      }
    };

  // =========================================================
  // LOAD DEVELOPMENT USERS
  // =========================================================

  const loadDevUsers =
    async () => {
      if (!import.meta.env.DEV) {
        return;
      }

      setLoadingDevUsers(true);

      try {
        const response =
          await authFetch(
            "/dev/users"
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

        setDevUsers(data);
      } catch (error) {
        console.error(
          "Failed to load development users:",
          error
        );

        showError(
          error.message
        );
      } finally {
        setLoadingDevUsers(
          false
        );
      }
    };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const start =
      async () => {
        setLoading(true);

        await loadGroups();

        setLoading(false);
      };

    start();
  }, []);

  // =========================================================
  // CLOSE ACCOUNT MENU
  // =========================================================

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          accountMenuRef.current &&
          !accountMenuRef.current.contains(
            event.target
          )
        ) {
          setShowAccountMenu(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =========================================================
  // OPEN ACCOUNT MENU
  // =========================================================

  const handleProfileClick =
    async () => {
      const opening =
        !showAccountMenu;

      setShowAccountMenu(opening);

      if (
        opening &&
        import.meta.env.DEV
      ) {
        await loadDevUsers();
      }
    };

  // =========================================================
  // CREATE GROUP
  // =========================================================

  const handleCreateGroup =
    async (e) => {
      e.preventDefault();

      if (!newGroupName.trim()) {
        showError(
          "Please enter a group name."
        );

        return;
      }

      setCreating(true);
      setStatus(null);

      try {
        const response =
          await authJsonFetch(
            "/groups",
            {
              method: "POST",

              body:
                JSON.stringify({
                  name:
                    newGroupName.trim(),
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

        setNewGroupName("");

        await loadGroups();

        showSuccess(
          "Group created successfully."
        );
      } catch (error) {
        console.error(error);

        showError(
          error.message
        );
      } finally {
        setCreating(false);
      }
    };

  // =========================================================
  // SWITCH ACCOUNT
  // =========================================================

  const switchAccount =
    async (account) => {
      if (
        account.email
          ?.toLowerCase() ===
        userEmail?.toLowerCase()
      ) {
        setShowAccountMenu(false);
        return;
      }

      setSwitchingAccount(
        account.email
      );

      setStatus(null);

      try {
        const response =
          await authJsonFetch(
            "/dev/switch-account",
            {
              method: "POST",

              body:
                JSON.stringify({
                  email:
                    account.email,
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

        const data =
          await response.json();

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "userName",
          data.name
        );

        localStorage.setItem(
          "userEmail",
          data.email
        );

        window.location.reload();
      } catch (error) {
        console.error(error);

        showError(
          error.message
        );

        setSwitchingAccount("");
      }
    };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout =
    () => {
      logoutUser();
    };

  // =========================================================
  // STATS
  // =========================================================

  const ownedGroups =
    useMemo(
      () =>
        groups.filter(
          (group) =>
            group.createdByEmail
              ?.toLowerCase() ===
            userEmail
              ?.toLowerCase()
        ),
      [
        groups,
        userEmail,
      ]
    );

  const totalBudget =
    useMemo(
      () =>
        groups.reduce(
          (
            total,
            group
          ) =>
            total +
            Number(
              group.budget || 0
            ),
          0
        ),
      [groups]
    );

  // =========================================================
  // ACTIVITY HELPERS
  // =========================================================

  const formatActivityTime =
    (createdAt) => {
      if (!createdAt) {
        return "";
      }

      const date =
        new Date(createdAt);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "";
      }

      return date.toLocaleString(
        "en-MY",
        {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };

  const getActivityIcon =
    (actionType) => {
      const type =
        actionType
          ?.toUpperCase() ||
        "";

      if (
        type.includes(
          "EXPENSE"
        )
      ) {
        return "💳";
      }

      if (
        type.includes(
          "PAYMENT"
        )
      ) {
        return "✓";
      }

      if (
        type.includes(
          "MEMBER"
        )
      ) {
        return "👤";
      }

      if (
        type.includes(
          "BUDGET"
        )
      ) {
        return "RM";
      }

      if (
        type.includes(
          "GROUP"
        )
      ) {
        return "👥";
      }

      return "•";
    };

  // =========================================================
  // GROUP PAGE
  // =========================================================

  if (selectedGroup) {
    return (
      <GroupPage
        group={
          selectedGroup
        }
        onBack={() => {
          setSelectedGroup(null);
          loadGroups();
        }}
      />
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-top">

          <div className="brand">

            <div className="brand-logo">
              S
            </div>

            <div className="brand-text">

              <h1>
                SplitFlow
              </h1>

              <span>
                Expense Manager
              </span>

            </div>

          </div>

          <nav className="sidebar-nav">

            <button
              className="nav-item active"
              type="button"
            >
              <span className="nav-icon">
                ◫
              </span>

              Dashboard
            </button>

          </nav>

        </div>

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="user-avatar">
              {userName
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}
            </div>

            <div className="sidebar-user-info">

              <strong>
                {userName || "User"}
              </strong>

              <span>
                {userEmail}
              </span>

            </div>

          </div>

          <button
            className="logout-btn"
            type="button"
            onClick={
              handleLogout
            }
          >
            ↪ Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="dashboard-main">

        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <p className="dashboard-eyebrow">
              OVERVIEW
            </p>

            <h1>
              Welcome back,{" "}
              {userName ||
                "User"} 👋
            </h1>

            <p className="dashboard-description">
              Manage your groups,
              track shared expenses
              and settle balances
              easily.
            </p>

          </div>

          {/* PROFILE */}

          <div
            className="profile-menu-wrapper"
            ref={
              accountMenuRef
            }
          >

            <button
              type="button"
              className="header-profile profile-button"
              onClick={
                handleProfileClick
              }
            >

              <div className="header-avatar">

                {userName
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "U"}

              </div>

              <div className="profile-details">

                <strong>
                  {userName ||
                    "User"}
                </strong>

                <span>
                  {userEmail}
                </span>

              </div>

              <span
                className={`profile-chevron ${
                  showAccountMenu
                    ? "open"
                    : ""
                }`}
              >
                ▾
              </span>

            </button>

            {/* ACCOUNT MENU */}

            {showAccountMenu && (

              <div className="account-menu">

                <div className="account-menu-header">

                  <span>
                    Current account
                  </span>

                  <strong>
                    {userName}
                  </strong>

                  <small>
                    {userEmail}
                  </small>

                </div>

                {import.meta.env.DEV && (

                  <>

                    <div className="account-menu-divider" />

                    <p className="account-menu-title">
                      SWITCH TEST ACCOUNT
                    </p>

                    {loadingDevUsers ? (

                      <div className="account-switch-loading">
                        Loading users...
                      </div>

                    ) : devUsers.length === 0 ? (

                      <div className="account-switch-loading">
                        No users found.
                      </div>

                    ) : (

                      <div className="account-list">

                        {devUsers.map(
                          (account) => {

                            const isCurrent =
                              account.email
                                ?.toLowerCase() ===
                              userEmail
                                ?.toLowerCase();

                            const isSwitching =
                              switchingAccount ===
                              account.email;

                            return (

                              <button
                                key={
                                  account.id ||
                                  account.email
                                }
                                type="button"
                                className={`account-option ${
                                  isCurrent
                                    ? "current"
                                    : ""
                                }`}
                                disabled={
                                  isCurrent ||
                                  Boolean(
                                    switchingAccount
                                  )
                                }
                                onClick={() =>
                                  switchAccount(
                                    account
                                  )
                                }
                              >

                                <div className="account-option-avatar">

                                  {account.name
                                    ?.charAt(
                                      0
                                    )
                                    ?.toUpperCase() ||
                                    "U"}

                                </div>

                                <div className="account-option-info">

                                  <strong>
                                    {account.name}
                                  </strong>

                                  <span>
                                    {account.email}
                                  </span>

                                </div>

                                <div className="account-option-status">

                                  {isCurrent
                                    ? "Current"
                                    : isSwitching
                                      ? "Switching..."
                                      : "Switch"}

                                </div>

                              </button>

                            );
                          }
                        )}

                      </div>

                    )}

                    <div className="development-badge">
                      Development only
                    </div>

                  </>

                )}

                <div className="account-menu-divider" />

                <button
                  type="button"
                  className="account-menu-logout"
                  onClick={
                    handleLogout
                  }
                >
                  ↪ Logout
                </button>

              </div>

            )}

          </div>

        </div>

        {/* STATUS */}

        {status && (

          <div
            className={`dashboard-status ${status.type}`}
          >

            <div className="dashboard-status-content">

              <span className="dashboard-status-icon">

                {status.type ===
                "success"
                  ? "✓"
                  : "!"}

              </span>

              <span>
                {status.message}
              </span>

            </div>

            <button
              type="button"
              onClick={() =>
                setStatus(null)
              }
            >
              ×
            </button>

          </div>

        )}

        {/* STATS */}

        <section className="dashboard-stats">

          <div className="dashboard-stat-card">

            <div className="stat-icon">
              👥
            </div>

            <div>

              <span className="stat-label">
                Total Groups
              </span>

              <strong>
                {groups.length}
              </strong>

              <small>
                All groups you belong to
              </small>

            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon">
              ★
            </div>

            <div>

              <span className="stat-label">
                Groups Owned
              </span>

              <strong>
                {ownedGroups.length}
              </strong>

              <small>
                Groups created by you
              </small>

            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon">
              💳
            </div>

            <div>

              <span className="stat-label">
                Spent This Month
              </span>

              <strong className="budget-stat">

                {loadingMonthlySpending
                  ? "..."
                  : `RM ${monthlySpending.toFixed(
                      2
                    )}`}

              </strong>

              <small>
                Across all your groups
              </small>

            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon">
              ↓
            </div>

            <div>

              <span className="stat-label">
                You Owe
              </span>

              <strong className="budget-stat">

                {loadingBalances
                  ? "..."
                  : `RM ${totalYouOwe.toFixed(
                      2
                    )}`}

              </strong>

              <small>
                Amount you need to pay
              </small>

            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon">
              ↑
            </div>

            <div>

              <span className="stat-label">
                You Are Owed
              </span>

              <strong className="budget-stat">

                {loadingBalances
                  ? "..."
                  : `RM ${totalYouAreOwed.toFixed(
                      2
                    )}`}

              </strong>

              <small>
                Amount others owe you
              </small>

            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon">
              RM
            </div>

            <div>

              <span className="stat-label">
                Combined Budget
              </span>

              <strong className="budget-stat">

                RM{" "}
                {totalBudget.toFixed(
                  2
                )}

              </strong>

              <small>
                Across all your groups
              </small>

            </div>

          </div>

        </section>

        {/* RECENT ACTIVITY */}

        <section className="recent-activity-card">

          <div className="recent-activity-header">

            <div>

              <p className="section-eyebrow">
                ACTIVITY
              </p>

              <h2>
                Recent Activity
              </h2>

              <p>
                Latest changes across
                your groups.
              </p>

            </div>

          </div>

          {loadingActivities ? (

            <div className="activity-empty">

              <div className="dashboard-spinner" />

              <span>
                Loading recent activity...
              </span>

            </div>

          ) : recentActivities.length === 0 ? (

            <div className="activity-empty">

              <div className="activity-empty-icon">
                ◷
              </div>

              <strong>
                No activity yet
              </strong>

              <span>
                Group activity will appear here.
              </span>

            </div>

          ) : (

            <div className="activity-list">

              {recentActivities.map(
                (activity) => (

                  <div
                    className="activity-item"
                    key={
                      `${activity.groupId}-${activity.id}`
                    }
                  >

                    <div className="activity-icon">

                      {getActivityIcon(
                        activity.actionType
                      )}

                    </div>

                    <div className="activity-content">

                      <strong>
                        {activity.message}
                      </strong>

                      <span>
                        {activity.groupName}
                      </span>

                    </div>

                    <div className="activity-time">

                      {formatActivityTime(
                        activity.createdAt
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* CREATE GROUP */}

        <section className="create-group-card">

          <div className="create-group-info">

            <div className="create-group-icon">
              +
            </div>

            <div>

              <h2>
                Create a new group
              </h2>

              <p>
                Start tracking expenses
                for trips, events,
                households or anything
                else.
              </p>

            </div>

          </div>

          <form
            className="create-group-form"
            onSubmit={
              handleCreateGroup
            }
          >

            <input
              type="text"
              placeholder="e.g. Penang Trip"
              value={
                newGroupName
              }
              maxLength={60}
              onChange={(e) =>
                setNewGroupName(
                  e.target.value
                )
              }
            />

            <button
              type="submit"
              disabled={
                creating
              }
            >

              {creating
                ? "Creating..."
                : "+ Create Group"}

            </button>

          </form>

        </section>

        {/* GROUPS */}

        <section className="groups-section">

          <div className="groups-heading">

            <div>

              <p className="section-eyebrow">
                GROUPS
              </p>

              <h2>
                Your Groups
              </h2>

              <p>
                Select a group
                to view expenses,
                balances and activity.
              </p>

            </div>

            {!loading &&
              groups.length > 0 && (

                <span className="group-count-badge">

                  {groups.length}{" "}

                  {groups.length === 1
                    ? "group"
                    : "groups"}

                </span>

              )}

          </div>

          {loading && (

            <div className="dashboard-loading">

              <div className="dashboard-spinner" />

              <p>
                Loading your groups...
              </p>

            </div>

          )}

          {!loading &&
            groups.length === 0 && (

              <div className="empty-groups">

                <div className="empty-groups-icon">
                  👥
                </div>

                <h3>
                  No groups yet
                </h3>

                <p>
                  Create your first
                  group above to start
                  tracking shared
                  expenses.
                </p>

              </div>

            )}

          {!loading &&
            groups.length > 0 && (

              <div className="group-card-grid">

                {groups.map(
                  (group) => {

                    const isOwner =
                      group
                        .createdByEmail
                        ?.toLowerCase() ===
                      userEmail
                        ?.toLowerCase();

                    const budget =
                      Number(
                        group.budget || 0
                      );

                    return (

                      <button
                        type="button"
                        key={
                          group.id
                        }
                        className="dashboard-group-card"
                        onClick={() =>
                          setSelectedGroup(
                            group
                          )
                        }
                      >

                        <div className="group-card-top">

                          <div className="group-icon">

                            {group.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "G"}

                          </div>

                          <span
                            className={
                              isOwner
                                ? "group-role owner"
                                : "group-role member"
                            }
                          >

                            {isOwner
                              ? "Owner"
                              : "Member"}

                          </span>

                        </div>

                        <div className="group-card-body">

                          <h3>
                            {group.name}
                          </h3>

                          <p className="group-id">

                            Group #
                            {group.id}

                          </p>

                        </div>

                        <div className="group-budget">

                          <span>
                            Group Budget
                          </span>

                          <strong>

                            RM{" "}
                            {budget.toFixed(
                              2
                            )}

                          </strong>

                        </div>

                        <div className="group-card-footer">

                          <span>
                            Open group
                          </span>

                          <span className="open-arrow">
                            →
                          </span>

                        </div>

                      </button>

                    );
                  }
                )}

              </div>

            )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;