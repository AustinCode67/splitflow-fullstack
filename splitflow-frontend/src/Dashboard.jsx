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



  const [

    selectedGroup,

    setSelectedGroup,

  ] = useState(null);



  const [

    newGroupName,

    setNewGroupName,

  ] = useState("");



  const [creating, setCreating] =

    useState(false);



  const [status, setStatus] =

    useState(null);



  // =========================================================

  // EXPENSE ANALYTICS

  // =========================================================



  const [

    monthlySpending,

    setMonthlySpending,

  ] = useState(0);



  const [

    monthlyChart,

    setMonthlyChart,

  ] = useState([]);



  const [

    categoryChart,

    setCategoryChart,

  ] = useState([]);



  const [

    loadingAnalytics,

    setLoadingAnalytics,

  ] = useState(false);



  const [

    allExpensesData,

    setAllExpensesData,

  ] = useState([]);



  // =========================================================

  // SMART RECEIPT INSIGHTS

  // =========================================================



  const [

    showReceiptInsights,

    setShowReceiptInsights,

  ] = useState(false);



  const [

    receiptInsightFile,

    setReceiptInsightFile,

  ] = useState(null);



  const [

    receiptInsightPreview,

    setReceiptInsightPreview,

  ] = useState("");



  const [

    receiptInsightResult,

    setReceiptInsightResult,

  ] = useState(null);



  const [

    receiptInsightStats,

    setReceiptInsightStats,

  ] = useState(null);



  const [

    scanningReceiptInsight,

    setScanningReceiptInsight,

  ] = useState(false);

  // =========================================================
  // SPLITFLOW ASSISTANT
  // =========================================================

  const [
    showAssistant,
    setShowAssistant,
  ] = useState(false);

  const [
    assistantInput,
    setAssistantInput,
  ] = useState("");

  const [
    assistantMessages,
    setAssistantMessages,
  ] = useState([
    {
      role: "assistant",
      text:
        "Hi! I’m your SplitFlow Assistant. Ask me about your spending, categories, groups, or monthly trends.",
    },
  ]);

  const [
    assistantContext,
    setAssistantContext,
  ] = useState({
    lastIntent: null,
    lastCategory: null,
  });

  const [
    assistantTyping,
    setAssistantTyping,
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



  const [devUsers, setDevUsers] =

    useState([]);



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

  // DELETE ACCOUNT

  // =========================================================



  const [

    showDeleteModal,

    setShowDeleteModal,

  ] = useState(false);



  const [

    deleteConfirmation,

    setDeleteConfirmation,

  ] = useState("");



  const [

    deletingAccount,

    setDeletingAccount,

  ] = useState(false);



  const [

    deleteError,

    setDeleteError,

  ] = useState("");

  // =========================================================
  // STRIPE / SPLITFLOW PLUS
  // =========================================================

  const [
    upgradingToPlus,
    setUpgradingToPlus,
  ] = useState(false);

  const [
    subscriptionPlan,
    setSubscriptionPlan,
  ] = useState("FREE");

  const [
    loadingSubscriptionPlan,
    setLoadingSubscriptionPlan,
  ] = useState(true);



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

  // LOAD EXPENSE ANALYTICS

  // =========================================================



  const loadExpenseAnalytics =

    async (groupList) => {

      if (

        !groupList ||

        groupList.length === 0

      ) {

        setMonthlySpending(0);

        setMonthlyChart([]);

        setCategoryChart([]);
        setAllExpensesData([]);

        return;

      }



      setLoadingAnalytics(true);



      try {

        const requests =

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



                const expenses =

                  await response.json();



                return expenses.map(

                  (expense) => ({

                    ...expense,

                    groupName:

                      group.name,

                  })

                );

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

            requests

          );



        const allExpenses =

          expenseLists.flat();



        setAllExpensesData(

          allExpenses

        );



        const now = new Date();



        // =====================================================

        // SPENT THIS MONTH

        // =====================================================



        let currentMonthTotal = 0;



        allExpenses.forEach(

          (expense) => {

            if (!expense.createdAt) {

              return;

            }



            const date =

              new Date(

                expense.createdAt

              );



            if (

              Number.isNaN(

                date.getTime()

              )

            ) {

              return;

            }



            if (

              date.getMonth() ===

                now.getMonth() &&

              date.getFullYear() ===

                now.getFullYear()

            ) {

              currentMonthTotal +=

                Number(

                  expense.amount ||

                    0

                );

            }

          }

        );



        setMonthlySpending(

          currentMonthTotal

        );



        // =====================================================

        // LAST 6 MONTHS

        // =====================================================



        const months = [];



        for (

          let offset = 5;

          offset >= 0;

          offset--

        ) {

          const date =

            new Date(

              now.getFullYear(),

              now.getMonth() -

                offset,

              1

            );



          months.push({

            year:

              date.getFullYear(),



            month:

              date.getMonth(),



            label:

              date.toLocaleString(

                "en-MY",

                {

                  month: "short",

                }

              ),



            total: 0,

          });

        }



        allExpenses.forEach(

          (expense) => {

            if (!expense.createdAt) {

              return;

            }



            const date =

              new Date(

                expense.createdAt

              );



            if (

              Number.isNaN(

                date.getTime()

              )

            ) {

              return;

            }



            const match =

              months.find(

                (month) =>

                  month.year ===

                    date.getFullYear() &&

                  month.month ===

                    date.getMonth()

              );



            if (match) {

              match.total +=

                Number(

                  expense.amount ||

                    0

                );

            }

          }

        );



        setMonthlyChart(

          months

        );



        // =====================================================

        // CATEGORY TOTALS

        // =====================================================



        const categoryTotals = {};



        allExpenses.forEach(

          (expense) => {

            const category =

              expense.category

                ?.trim() ||

              "Other";



            categoryTotals[

              category

            ] =

              (

                categoryTotals[

                  category

                ] || 0

              ) +

              Number(

                expense.amount || 0

              );

          }

        );



        const categoryData =

          Object.entries(

            categoryTotals

          )

            .map(

              ([

                category,

                total,

              ]) => ({

                category,

                total,

              })

            )

            .sort(

              (a, b) =>

                b.total -

                a.total

            )

            .slice(0, 6);



        setCategoryChart(

          categoryData

        );

      } catch (error) {

        console.error(

          "Failed to load expense analytics:",

          error

        );



        setMonthlySpending(0);

        setMonthlyChart([]);

        setCategoryChart([]);

        setAllExpensesData([]);

      } finally {

        setLoadingAnalytics(

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

        const requests =

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



                const entry =

                  Object.entries(

                    balances

                  ).find(

                    ([email]) =>

                      email.toLowerCase() ===

                      userEmail?.toLowerCase()

                  );



                if (!entry) {

                  return 0;

                }



                return Number(

                  entry[1] || 0

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



        const balances =

          await Promise.all(

            requests

          );



        let owe = 0;

        let owed = 0;



        balances.forEach(

          (balance) => {

            if (balance < 0) {

              owe +=

                Math.abs(

                  balance

                );

            }



            if (balance > 0) {

              owed += balance;

            }

          }

        );



        setTotalYouOwe(owe);



        setTotalYouAreOwed(

          owed

        );

      } catch (error) {

        console.error(

          "Failed to load balance summary:",

          error

        );



        setTotalYouOwe(0);

        setTotalYouAreOwed(0);

      } finally {

        setLoadingBalances(

          false

        );

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

        const requests =

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



        const lists =

          await Promise.all(

            requests

          );



        const activities =

          lists.flat();



        activities.sort(

          (a, b) =>

            new Date(

              b.createdAt

            ).getTime() -

            new Date(

              a.createdAt

            ).getTime()

        );



        setRecentActivities(

          activities.slice(

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

        setLoadingActivities(

          false

        );

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

          loadExpenseAnalytics(

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

  // DEVELOPMENT USERS

  // =========================================================



  const loadDevUsers = async () => {

  if (!import.meta.env.DEV) {

    return;

  }



  setLoadingDevUsers(true);



  try {

    const response = await authFetch(

      "/dev/users"

    );



    if (!response.ok) {

      setDevUsers([]);

      return;

    }



    const data =

      await response.json();



    setDevUsers(data);

  } catch (error) {

    console.warn(

      "Dev account switcher unavailable:",

      error

    );



    setDevUsers([]);

  } finally {

    setLoadingDevUsers(false);

  }

};



  // =========================================================
  // LOAD CURRENT USER / SUBSCRIPTION PLAN
  // =========================================================

  const loadCurrentUserPlan = async () => {
    setLoadingSubscriptionPlan(true);

    try {
      const response = await authFetch(
        "/users/me"
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response)
        );
      }

      const data = await response.json();

      setSubscriptionPlan(
        data.plan || "FREE"
      );
    } catch (error) {
      console.error(
        "Failed to load subscription plan:",
        error
      );

      setSubscriptionPlan("FREE");
    } finally {
      setLoadingSubscriptionPlan(false);
    }
  };


  // =========================================================

  // INITIAL LOAD

  // =========================================================



  useEffect(() => {

    const start =

      async () => {

        setLoading(true);



        await Promise.all([
          loadGroups(),
          loadCurrentUserPlan(),
        ]);

        const params =
          new URLSearchParams(
            window.location.search
          );

        if (
          params.get("payment") ===
          "success"
        ) {
          showSuccess(
            "Payment successful. Your SplitFlow Plus status has been refreshed."
          );
        }

        if (
          params.get("payment") ===
          "cancel"
        ) {
          showError(
            "Stripe checkout was cancelled."
          );
        }

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

          setShowAccountMenu(

            false

          );

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

  // PROFILE

  // =========================================================



  const handleProfileClick =

    async () => {

      const opening =

        !showAccountMenu;



      setShowAccountMenu(

        opening

      );



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



      if (

        !newGroupName.trim()

      ) {

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

        userEmail

          ?.toLowerCase()

      ) {

        setShowAccountMenu(

          false

        );



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



        setSwitchingAccount(

          ""

        );

      }

    };



  // =========================================================

  // LOGOUT

  // =========================================================



  const handleLogout = () => {

    logoutUser();

  };



  // =========================================================

  // DELETE ACCOUNT

  // =========================================================



  const openDeleteModal = () => {

    setShowAccountMenu(false);



    setDeleteConfirmation(

      ""

    );



    setDeleteError("");



    setShowDeleteModal(

      true

    );

  };



  const closeDeleteModal = () => {

    if (deletingAccount) {

      return;

    }



    setShowDeleteModal(

      false

    );



    setDeleteConfirmation(

      ""

    );



    setDeleteError("");

  };



  const handleDeleteAccount =

    async () => {

      if (

        deleteConfirmation !==

        "DELETE"

      ) {

        setDeleteError(

          'Please type "DELETE" exactly to confirm.'

        );



        return;

      }



      setDeletingAccount(

        true

      );



      setDeleteError("");



      try {

        const response =

          await authFetch(

            "/users/me",

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



        logoutUser();

      } catch (error) {

        console.error(

          "Failed to delete account:",

          error

        );



        setDeleteError(

          error.message ||

            "Unable to delete your account."

        );

      } finally {

        setDeletingAccount(

          false

        );

      }

    };

  // =========================================================
  // STRIPE CHECKOUT
  // =========================================================

  const handleUpgradeToPlus =
    async () => {
      if (subscriptionPlan === "PLUS") {
        showSuccess(
          "You already have SplitFlow Plus."
        );
        return;
      }

      setUpgradingToPlus(true);
      setStatus(null);

      try {
        const response =
          await authFetch(
            "/payments/create-checkout-session",
            {
              method: "POST",
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

        if (!data.url) {
          throw new Error(
            "Stripe checkout URL was not returned."
          );
        }

        window.location.href =
          data.url;
      } catch (error) {
        console.error(
          "Unable to start Stripe checkout:",
          error
        );

        showError(
          error.message ||
            "Unable to start checkout."
        );
      } finally {
        setUpgradingToPlus(false);
      }
    };




  // =========================================================
  // SPLITFLOW ASSISTANT
  // =========================================================

  const formatAssistantMoney =
    (value) =>
      `RM ${Number(
        value || 0
      ).toFixed(2)}`;

  const getAssistantExpenseDate =
    (expense) => {

      const rawDate =
        expense.createdAt ||
        expense.date;

      if (!rawDate) {
        return null;
      }

      const date =
        new Date(
          rawDate
        );

      return Number.isNaN(
        date.getTime()
      )
        ? null
        : date;
    };

  const getAssistantMonthExpenses =
    (monthOffset = 0) => {

      const now =
        new Date();

      const target =
        new Date(
          now.getFullYear(),
          now.getMonth() +
            monthOffset,
          1
        );

      return allExpensesData.filter(
        (expense) => {

          const date =
            getAssistantExpenseDate(
              expense
            );

          return (
            date &&
            date.getFullYear() ===
              target.getFullYear() &&
            date.getMonth() ===
              target.getMonth()
          );
        }
      );
    };

  const sumAssistantExpenses =
    (expenses) =>
      expenses.reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount || 0
          ),
        0
      );

  const getAssistantCategoryTotals =
    (expenses) => {

      const totals = {};

      expenses.forEach(
        (expense) => {

          const categoryName =
            expense.category?.trim() ||
            "Other";

          totals[
            categoryName
          ] =
            (
              totals[
                categoryName
              ] || 0
            ) +
            Number(
              expense.amount || 0
            );
        }
      );

      return totals;
    };

  const findAssistantCategory =
    (question) => {

      const knownCategories = [
        "Food",
        "Transport",
        "Shopping",
        "Entertainment",
        "Accommodation",
        "Utilities",
        "Groceries",
        "Travel",
        "Other",
      ];

      const lower =
        question.toLowerCase();

      return (
        knownCategories.find(
          (item) =>
            lower.includes(
              item.toLowerCase()
            )
        ) || null
      );
    };

  const answerAssistantQuestion =
    (rawQuestion) => {

      const originalQuestion =
        rawQuestion.trim();

      const question =
        originalQuestion.toLowerCase();

      if (!question) {
        return {
          text:
            "Ask me something about your SplitFlow spending.",
          intent: null,
          category: null,
        };
      }

      const currentMonth =
        getAssistantMonthExpenses(
          0
        );

      const previousMonth =
        getAssistantMonthExpenses(
          -1
        );

      const currentTotal =
        sumAssistantExpenses(
          currentMonth
        );

      const previousTotal =
        sumAssistantExpenses(
          previousMonth
        );

      const currentCategories =
        getAssistantCategoryTotals(
          currentMonth
        );

      const previousCategories =
        getAssistantCategoryTotals(
          previousMonth
        );

      const explicitCategory =
        findAssistantCategory(
          question
        );

      const category =
        explicitCategory ||
        (
          (
            question.includes(
              "what about"
            ) ||
            question.startsWith(
              "and "
            ) ||
            question.includes(
              "that category"
            )
          )
            ? assistantContext.lastCategory
            : null
        );

      // -----------------------------------------------------
      // SOCIAL / CONVERSATIONAL
      // -----------------------------------------------------

      if (
        /^(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/.test(
          question
        )
      ) {
        return {
          text:
            "Hey 👋 I’m your SplitFlow Assistant. You can ask me things like “How much did I spend this month?”, “What is my biggest category?”, or “Compare this month with last month.”",
          intent: "GREETING",
          category: null,
        };
      }

      if (
        question.includes(
          "thank"
        ) ||
        question === "thanks"
      ) {
        return {
          text:
            "You’re welcome! Ask me anything else about your SplitFlow spending.",
          intent: "THANKS",
          category:
            assistantContext.lastCategory,
        };
      }

      if (
        question.includes(
          "what can you do"
        ) ||
        question.includes(
          "help"
        ) ||
        question.includes(
          "what can i ask"
        )
      ) {
        return {
          text:
            "I can analyse your monthly spending, category totals, largest expense, top category, average spending, group spending, month-to-month changes, and give simple saving suggestions. You can also ask follow-ups like “what about Food?” or “and last month?”",
          intent: "HELP",
          category:
            assistantContext.lastCategory,
        };
      }

      // -----------------------------------------------------
      // FOLLOW-UP: "what about last month?"
      // -----------------------------------------------------

      if (
        question.includes(
          "last month"
        ) &&
        assistantContext.lastIntent ===
          "CATEGORY_SPENDING" &&
        assistantContext.lastCategory
      ) {

        const previousCategoryTotal =
          Number(
            previousCategories[
              assistantContext.lastCategory
            ] || 0
          );

        return {
          text: `Last month, your ${assistantContext.lastCategory} spending was ${formatAssistantMoney(
            previousCategoryTotal
          )}.`,
          intent:
            "CATEGORY_SPENDING",
          category:
            assistantContext.lastCategory,
        };
      }

      // -----------------------------------------------------
      // CATEGORY SPENDING
      // -----------------------------------------------------

      if (
        category &&
        (
          question.includes(
            "spend"
          ) ||
          question.includes(
            "spent"
          ) ||
          question.includes(
            "how much"
          ) ||
          question.startsWith(
            "what about"
          ) ||
          question.startsWith(
            "and "
          )
        )
      ) {

        const categoryTotal =
          Number(
            currentCategories[
              category
            ] || 0
          );

        const share =
          currentTotal > 0
            ? (
                categoryTotal /
                currentTotal
              ) *
              100
            : 0;

        return {
          text: `${category} spending this month is ${formatAssistantMoney(
            categoryTotal
          )}. That is ${share.toFixed(
            1
          )}% of your recorded monthly spending.`,
          intent:
            "CATEGORY_SPENDING",
          category,
        };
      }

      // -----------------------------------------------------
      // BIGGEST EXPENSE
      // -----------------------------------------------------

      if (
        question.includes(
          "biggest expense"
        ) ||
        question.includes(
          "largest expense"
        ) ||
        question.includes(
          "most expensive"
        )
      ) {

        if (
          currentMonth.length ===
          0
        ) {
          return {
            text:
              "You do not have any recorded expenses for this month yet.",
            intent:
              "BIGGEST_EXPENSE",
            category: null,
          };
        }

        const biggest =
          currentMonth.reduce(
            (
              highest,
              expense
            ) =>
              Number(
                expense.amount ||
                  0
              ) >
              Number(
                highest.amount ||
                  0
              )
                ? expense
                : highest
          );

        return {
          text: `Your largest recorded expense this month is ${
            biggest.description ||
            "an expense"
          } at ${formatAssistantMoney(
            biggest.amount
          )}${
            biggest.category
              ? ` in ${biggest.category}`
              : ""
          }.`,
          intent:
            "BIGGEST_EXPENSE",
          category:
            biggest.category ||
            null,
        };
      }

      // -----------------------------------------------------
      // TOP CATEGORY
      // -----------------------------------------------------

      if (
        question.includes(
          "biggest category"
        ) ||
        question.includes(
          "top category"
        ) ||
        question.includes(
          "spend the most on"
        ) ||
        question.includes(
          "largest category"
        )
      ) {

        const entries =
          Object.entries(
            currentCategories
          );

        if (
          entries.length === 0
        ) {
          return {
            text:
              "There is not enough spending data this month to identify a top category.",
            intent:
              "TOP_CATEGORY",
            category: null,
          };
        }

        const [
          topCategory,
          topAmount,
        ] =
          entries.reduce(
            (
              highest,
              current
            ) =>
              current[1] >
              highest[1]
                ? current
                : highest
          );

        const percentage =
          currentTotal > 0
            ? (
                topAmount /
                currentTotal
              ) *
              100
            : 0;

        return {
          text: `${topCategory} is your biggest spending category this month at ${formatAssistantMoney(
            topAmount
          )}, or ${percentage.toFixed(
            1
          )}% of your monthly spending.`,
          intent:
            "TOP_CATEGORY",
          category:
            topCategory,
        };
      }

      // -----------------------------------------------------
      // MONTH COMPARISON
      // -----------------------------------------------------

      if (
        question.includes(
          "compare"
        ) ||
        question.includes(
          "higher than last month"
        ) ||
        question.includes(
          "lower than last month"
        )
      ) {

        if (
          previousTotal <= 0
        ) {
          return {
            text: `You have spent ${formatAssistantMoney(
              currentTotal
            )} this month. There is not enough recorded data from last month for a meaningful comparison.`,
            intent:
              "MONTH_COMPARISON",
            category: null,
          };
        }

        const change =
          (
            (
              currentTotal -
              previousTotal
            ) /
            previousTotal
          ) *
          100;

        return {
          text: `You have spent ${formatAssistantMoney(
            currentTotal
          )} this month versus ${formatAssistantMoney(
            previousTotal
          )} last month. That is ${Math.abs(
            change
          ).toFixed(
            1
          )}% ${
            change >= 0
              ? "higher"
              : "lower"
          }.`,
          intent:
            "MONTH_COMPARISON",
          category: null,
        };
      }

      // -----------------------------------------------------
      // PLAIN LAST MONTH TOTAL
      // -----------------------------------------------------

      if (
        question.includes(
          "last month"
        )
      ) {
        return {
          text: `Your recorded spending last month was ${formatAssistantMoney(
            previousTotal
          )} across ${
            previousMonth.length
          } ${
            previousMonth.length ===
            1
              ? "expense"
              : "expenses"
          }.`,
          intent:
            "MONTHLY_TOTAL",
          category: null,
        };
      }

      // -----------------------------------------------------
      // GROUP WITH MOST SPENDING
      // -----------------------------------------------------

      if (
        question.includes(
          "which group"
        ) &&
        (
          question.includes(
            "most"
          ) ||
          question.includes(
            "highest"
          ) ||
          question.includes(
            "spent"
          )
        )
      ) {

        const groupTotals = {};

        allExpensesData.forEach(
          (expense) => {

            const groupId =
              expense.groupId ||
              expense.group?.id;

            if (!groupId) {
              return;
            }

            groupTotals[
              groupId
            ] =
              (
                groupTotals[
                  groupId
                ] || 0
              ) +
              Number(
                expense.amount || 0
              );
          }
        );

        const ranked =
          Object.entries(
            groupTotals
          ).sort(
            (a, b) =>
              b[1] - a[1]
          );

        if (
          ranked.length === 0
        ) {
          return {
            text:
              "I cannot determine group totals from the expense data currently available.",
            intent:
              "GROUP_SPENDING",
            category: null,
          };
        }

        const [
          topGroupId,
          topGroupTotal,
        ] =
          ranked[0];

        const topGroup =
          groups.find(
            (group) =>
              String(
                group.id
              ) ===
              String(
                topGroupId
              )
          );

        return {
          text: `${
            topGroup?.name ||
            `Group #${topGroupId}`
          } has the highest recorded spending at ${formatAssistantMoney(
            topGroupTotal
          )}.`,
          intent:
            "GROUP_SPENDING",
          category: null,
        };
      }

      // -----------------------------------------------------
      // AVERAGE EXPENSE
      // -----------------------------------------------------

      if (
        question.includes(
          "average expense"
        ) ||
        question.includes(
          "average spending"
        ) ||
        question.includes(
          "usually spend"
        )
      ) {

        const average =
          currentMonth.length > 0
            ? currentTotal /
              currentMonth.length
            : 0;

        return {
          text: `Your average recorded expense this month is ${formatAssistantMoney(
            average
          )}.`,
          intent:
            "AVERAGE_EXPENSE",
          category: null,
        };
      }

      // -----------------------------------------------------
      // SPENDING ADVICE
      // -----------------------------------------------------

      if (
        question.includes(
          "advice"
        ) ||
        question.includes(
          "save money"
        ) ||
        question.includes(
          "reduce spending"
        ) ||
        question.includes(
          "overspending"
        ) ||
        question.includes(
          "spending too much"
        )
      ) {

        const entries =
          Object.entries(
            currentCategories
          ).sort(
            (a, b) =>
              b[1] - a[1]
          );

        if (
          entries.length === 0
        ) {
          return {
            text:
              "Add some expenses first and I can give you spending suggestions based on your actual SplitFlow data.",
            intent:
              "SPENDING_ADVICE",
            category: null,
          };
        }

        const [
          topCategory,
          topAmount,
        ] =
          entries[0];

        return {
          text: `${topCategory} is currently your largest category at ${formatAssistantMoney(
            topAmount
          )}. Reducing that category by 10% would save about ${formatAssistantMoney(
            topAmount *
              0.1
          )}.`,
          intent:
            "SPENDING_ADVICE",
          category:
            topCategory,
        };
      }

      // -----------------------------------------------------
      // MONTHLY TOTAL
      // -----------------------------------------------------

      if (
        question.includes(
          "this month"
        ) ||
        question.includes(
          "monthly spending"
        ) ||
        question.includes(
          "total spending"
        ) ||
        question.includes(
          "how much have i spent"
        ) ||
        question.includes(
          "how much did i spend"
        )
      ) {

        return {
          text: `Your recorded spending this month is ${formatAssistantMoney(
            currentTotal
          )} across ${
            currentMonth.length
          } ${
            currentMonth.length ===
            1
              ? "expense"
              : "expenses"
          }.`,
          intent:
            "MONTHLY_TOTAL",
          category: null,
        };
      }

      // -----------------------------------------------------
      // FOLLOW-UP: generic "what about ..."
      // -----------------------------------------------------

      if (
        question.startsWith(
          "what about"
        ) ||
        question.startsWith(
          "and "
        )
      ) {
        return {
          text:
            "I remember the previous topic, but I need a little more detail. Try “what about last month?” or “and Food?”.",
          intent:
            assistantContext.lastIntent,
          category:
            assistantContext.lastCategory,
        };
      }

      // -----------------------------------------------------
      // FALLBACK
      // -----------------------------------------------------

      return {
        text:
          "I’m still learning. I can currently talk about monthly spending, categories, your biggest expense, top category, month-to-month comparisons, averages, group spending, and saving suggestions. Try asking in a different way.",
        intent: null,
        category:
          assistantContext.lastCategory,
      };
    };

  const buildAssistantFinancialContext =
    () => {

      const currentMonth =
        getAssistantMonthExpenses(
          0
        );

      const previousMonth =
        getAssistantMonthExpenses(
          -1
        );

      const currentTotal =
        sumAssistantExpenses(
          currentMonth
        );

      const previousTotal =
        sumAssistantExpenses(
          previousMonth
        );

      const currentCategories =
        getAssistantCategoryTotals(
          currentMonth
        );

      const categoryLines =
        Object.entries(
          currentCategories
        )
          .sort(
            (a, b) =>
              b[1] - a[1]
          )
          .map(
            ([name, value]) =>
              `${name}: ${formatAssistantMoney(
                value
              )}`
          );

      const recentExpenses =
        allExpensesData
          .slice()
          .sort(
            (a, b) =>
              Number(
                b.id || 0
              ) -
              Number(
                a.id || 0
              )
          )
          .slice(
            0,
            15
          )
          .map(
            (expense) =>
              `- ${
                expense.description ||
                "Expense"
              } | ${formatAssistantMoney(
                expense.amount
              )} | ${
                expense.category ||
                "Other"
              } | Group ID ${
                expense.groupId ||
                expense.group?.id ||
                "unknown"
              }`
          );

      const groupLines =
        groups.map(
          (group) =>
            `- Group #${group.id}: ${group.name}`
        );

      return [
        `Current month total spending: ${formatAssistantMoney(
          currentTotal
        )}`,
        `Previous month total spending: ${formatAssistantMoney(
          previousTotal
        )}`,
        "",
        "Current month spending by category:",
        ...(categoryLines.length > 0
          ? categoryLines
          : ["No category data available."]),
        "",
        "Groups:",
        ...(groupLines.length > 0
          ? groupLines
          : ["No groups available."]),
        "",
        "Recent expenses:",
        ...(recentExpenses.length > 0
          ? recentExpenses
          : ["No recent expenses available."]),
      ].join(
        "\\n"
      );
    };



  const sendAssistantMessage =
    async (
      messageOverride = null
    ) => {

      const question =
        (
          messageOverride ??
          assistantInput
        ).trim();

      if (!question) {
        return;
      }

      const previousHistory =
        assistantMessages
          .slice(
            -10
          )
          .map(
            (message) => ({
              role:
                message.role,
              text:
                message.text,
            })
          );

      setAssistantMessages(
        (current) => [
          ...current,
          {
            role: "user",
            text: question,
          },
        ]
      );

      setAssistantInput("");
      setAssistantTyping(true);

      try {

        const response =
          await authJsonFetch(
            "/assistant/chat",
            {
              method: "POST",
              body:
                JSON.stringify({
                  message:
                    question,
                  context:
                    buildAssistantFinancialContext(),
                  history:
                    previousHistory,
                }),
            }
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

        setAssistantMessages(
          (current) => [
            ...current,
            {
              role:
                "assistant",
              text:
                data.reply ||
                "I couldn't generate a response.",
              provider:
                data.provider ||
                "gemini",
            },
          ]
        );

      } catch (error) {

        console.warn(
          "Gemini unavailable. Using local SplitFlow fallback:",
          error
        );

        const localResult =
          answerAssistantQuestion(
            question
          );

        setAssistantMessages(
          (current) => [
            ...current,
            {
              role:
                "assistant",
              text:
                localResult.text,
              provider:
                "local",
            },
          ]
        );

        setAssistantContext(
          {
            lastIntent:
              localResult.intent ||
              assistantContext.lastIntent,
            lastCategory:
              localResult.category ||
              assistantContext.lastCategory,
          }
        );

      } finally {

        setAssistantTyping(
          false
        );
      }
    };



  const assistantSuggestions = [
    "This month",
    "Top category",
    "Largest expense",
    "Compare months",
  ];

  // =========================================================
  // SMART RECEIPT INSIGHTS
  // =========================================================

  const resetReceiptInsights =
    () => {

      if (
        receiptInsightPreview
      ) {
        URL.revokeObjectURL(
          receiptInsightPreview
        );
      }

      setReceiptInsightFile(
        null
      );

      setReceiptInsightPreview(
        ""
      );

      setReceiptInsightResult(
        null
      );

      setReceiptInsightStats(
        null
      );

      setScanningReceiptInsight(
        false
      );
    };



  const closeReceiptInsights =
    () => {

      resetReceiptInsights();

      setShowReceiptInsights(
        false
      );
    };



  const handleReceiptInsightFile =
    (event) => {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        showError(
          "Please choose a receipt image."
        );

        return;
      }

      if (
        receiptInsightPreview
      ) {
        URL.revokeObjectURL(
          receiptInsightPreview
        );
      }

      setReceiptInsightFile(
        file
      );

      setReceiptInsightPreview(
        URL.createObjectURL(
          file
        )
      );

      setReceiptInsightResult(
        null
      );

      setReceiptInsightStats(
        null
      );
    };



  const calculateReceiptStats =
    (receipt) => {

      const receiptTotal =
        Number(
          receipt.total || 0
        );

      const receiptCategory =
        receipt.category ||
        "Other";

      const now =
        new Date();

      const currentYear =
        now.getFullYear();

      const currentMonth =
        now.getMonth();

      const previousDate =
        new Date(
          currentYear,
          currentMonth - 1,
          1
        );

      const previousYear =
        previousDate.getFullYear();

      const previousMonth =
        previousDate.getMonth();

      let currentMonthTotal = 0;

      let currentCategoryTotal = 0;

      let previousCategoryTotal = 0;

      let categoryExpenseTotal = 0;

      let categoryExpenseCount = 0;



      allExpensesData.forEach(
        (expense) => {

          const amount =
            Number(
              expense.amount || 0
            );

          const expenseCategory =
            expense.category?.trim() ||
            "Other";

          if (
            expenseCategory ===
            receiptCategory
          ) {
            categoryExpenseTotal +=
              amount;

            categoryExpenseCount +=
              1;
          }

          if (
            !expense.createdAt
          ) {
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

          if (
            expenseDate.getFullYear() ===
              currentYear &&
            expenseDate.getMonth() ===
              currentMonth
          ) {
            currentMonthTotal +=
              amount;

            if (
              expenseCategory ===
              receiptCategory
            ) {
              currentCategoryTotal +=
                amount;
            }
          }

          if (
            expenseDate.getFullYear() ===
              previousYear &&
            expenseDate.getMonth() ===
              previousMonth &&
            expenseCategory ===
              receiptCategory
          ) {
            previousCategoryTotal +=
              amount;
          }
        }
      );



      const newMonthTotal =
        currentMonthTotal +
        receiptTotal;

      const newCategoryTotal =
        currentCategoryTotal +
        receiptTotal;

      const categoryShare =
        newMonthTotal > 0
          ? (
              newCategoryTotal /
              newMonthTotal
            ) *
            100
          : 0;

      const categoryAverage =
        categoryExpenseCount + 1 > 0
          ? (
              categoryExpenseTotal +
              receiptTotal
            ) /
            (
              categoryExpenseCount +
              1
            )
          : receiptTotal;

      let monthChange = null;

      if (
        previousCategoryTotal > 0
      ) {
        monthChange =
          (
            (
              newCategoryTotal -
              previousCategoryTotal
            ) /
            previousCategoryTotal
          ) *
          100;
      }



      return {
        receiptTotal,
        receiptCategory,
        currentMonthTotal,
        newMonthTotal,
        currentCategoryTotal,
        newCategoryTotal,
        previousCategoryTotal,
        categoryShare,
        categoryAverage,
        monthChange,
        itemCount:
          Array.isArray(
            receipt.items
          )
            ? receipt.items.length
            : 0,
      };
    };



  const handleAnalyseReceipt =
    async () => {

      if (
        !receiptInsightFile
      ) {
        showError(
          "Choose a receipt image first."
        );

        return;
      }

      setScanningReceiptInsight(
        true
      );

      setStatus(null);

      try {

        const formData =
          new FormData();

        formData.append(
          "file",
          receiptInsightFile
        );

        const response =
          await authFetch(
            "/receipts/scan",
            {
              method: "POST",
              body: formData,
            }
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

        const normalized = {
          merchant:
            data.merchant || "",
          date:
            data.date || "",
          currency:
            data.currency ||
            "MYR",
          subtotal:
            Number(
              data.subtotal || 0
            ),
          tax:
            Number(
              data.tax || 0
            ),
          serviceCharge:
            Number(
              data.serviceCharge ||
              0
            ),
          total:
            Number(
              data.total || 0
            ),
          category:
            data.category ||
            "Other",
          items:
            Array.isArray(
              data.items
            )
              ? data.items
              : [],
        };

        setReceiptInsightResult(
          normalized
        );

        setReceiptInsightStats(
          calculateReceiptStats(
            normalized
          )
        );

      } catch (error) {

        console.error(
          "Receipt insight failed:",
          error
        );

        showError(
          error.message ||
            "Unable to analyse receipt."
        );

      } finally {

        setScanningReceiptInsight(
          false
        );
      }
    };



  // =========================================================

  // QUICK ACTIONS

  // =========================================================



  const scrollToSection =

    (selector) => {

      document

        .querySelector(

          selector

        )

        ?.scrollIntoView({

          behavior: "smooth",

          block: "start",

        });

    };



  const handleRefreshDashboard =

    async () => {

      setLoading(true);

      setStatus(null);



      try {

        await loadGroups();



        showSuccess(

          "Dashboard refreshed."

        );

      } catch (error) {

        console.error(error);



        showError(

          "Unable to refresh dashboard."

        );

      } finally {

        setLoading(false);

      }

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

              group.budget ||

                0

            ),

          0

        ),

      [groups]

    );



  // =========================================================

  // ANALYTICS INSIGHT

  // =========================================================



  const totalCategorySpending =

    useMemo(

      () =>

        categoryChart.reduce(

          (

            total,

            item

          ) =>

            total +

            Number(

              item.total || 0

            ),

          0

        ),

      [categoryChart]

    );



  const topCategory =

    categoryChart.length > 0

      ? categoryChart[0]

      : null;



  const topCategoryPercentage =

    topCategory &&

    totalCategorySpending > 0

      ? (

          (

            topCategory.total /

            totalCategorySpending

          ) *

          100

        ).toFixed(1)

      : "0.0";



  // =========================================================

  // HELPERS

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



  const maxMonthlyValue =

    Math.max(

      ...monthlyChart.map(

        (month) =>

          month.total

      ),

      1

    );



  const maxCategoryValue =

    Math.max(

      ...categoryChart.map(

        (item) =>

          item.total

      ),

      1

    );



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

          setSelectedGroup(

            null

          );



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

                {userName ||

                  "User"}

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



                    ) : devUsers.length ===

                      0 ? (



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



                <button

                  type="button"

                  className="account-menu-delete"

                  onClick={

                    openDeleteModal

                  }

                >

                  🗑 Delete Account

                </button>



              </div>



            )}



          </div>



        </div>



        {/* QUICK ACTIONS */}



        <section className="quick-actions-section">



          <div className="quick-actions-heading">



            <div>



              <p className="section-eyebrow">

                QUICK ACTIONS

              </p>



              <h2>

                What would you like to do?

              </h2>



            </div>



          </div>



          <div className="quick-actions-grid">



            <button

              type="button"

              className="quick-action-card primary"

              onClick={() =>

                scrollToSection(

                  ".create-group-card"

                )

              }

            >



              <div className="quick-action-icon">

                +

              </div>



              <div className="quick-action-content">



                <strong>

                  Create Group

                </strong>



                <span>

                  Start a new shared expense group

                </span>



              </div>



              <div className="quick-action-arrow">

                →

              </div>



            </button>



            <button

              type="button"

              className="quick-action-card"

              onClick={() =>

                scrollToSection(

                  ".groups-section"

                )

              }

            >



              <div className="quick-action-icon">

                👥

              </div>



              <div className="quick-action-content">



                <strong>

                  View Groups

                </strong>



                <span>

                  Open and manage your groups

                </span>



              </div>



              <div className="quick-action-arrow">

                →

              </div>



            </button>



            <button

              type="button"

              className="quick-action-card smart-receipt-action"

              onClick={() => {

                resetReceiptInsights();

                setShowReceiptInsights(
                  true
                );

              }}

            >



              <div className="quick-action-icon">

                🧾

              </div>



              <div className="quick-action-content">



                <strong>

                  Smart Receipt Insights

                </strong>



                <span>

                  Scan a receipt and analyse your spending

                </span>



              </div>



              <div className="quick-action-arrow">

                →

              </div>



            </button>



            <button

              type="button"

              className="quick-action-card"

              onClick={() =>

                scrollToSection(

                  ".spending-overview"

                )

              }

            >



              <div className="quick-action-icon">

                📊

              </div>



              <div className="quick-action-content">



                <strong>

                  View Analytics

                </strong>



                <span>

                  Explore your spending trends

                </span>



              </div>



              <div className="quick-action-arrow">

                →

              </div>



            </button>



            <button

              type="button"

              className="quick-action-card"

              onClick={

                handleRefreshDashboard

              }

            >



              <div className="quick-action-icon">

                ↻

              </div>



              <div className="quick-action-content">



                <strong>

                  Refresh Dashboard

                </strong>



                <span>

                  Reload balances and activity

                </span>



              </div>



              <div className="quick-action-arrow">

                →

              </div>



            </button>

            {subscriptionPlan === "PLUS" ? (
              <button
                type="button"
                className="quick-action-card"
                disabled
              >

                <div className="quick-action-icon">
                  ✓
                </div>

                <div className="quick-action-content">

                  <strong>
                    SplitFlow Plus
                  </strong>

                  <span>
                    Your premium subscription is active
                  </span>

                </div>

                <div className="quick-action-arrow">
                  ✓
                </div>

              </button>
            ) : (
              <button
                type="button"
                className="quick-action-card"
                onClick={
                  handleUpgradeToPlus
                }
                disabled={
                  upgradingToPlus ||
                  loadingSubscriptionPlan
                }
              >

                <div className="quick-action-icon">
                  ★
                </div>

                <div className="quick-action-content">

                  <strong>
                    SplitFlow Plus
                  </strong>

                  <span>
                    {loadingSubscriptionPlan
                      ? "Checking subscription..."
                      : upgradingToPlus
                        ? "Opening checkout..."
                        : "Upgrade for RM7.90/month"}
                  </span>

                </div>

                <div className="quick-action-arrow">
                  →
                </div>

              </button>
            )}



          </div>



        </section>



        {/* SMART RECEIPT INSIGHTS MODAL */}

        {showReceiptInsights && (

          <div
            className="receipt-insights-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeReceiptInsights();
              }
            }}
          >

            <div className="receipt-insights-modal">

              <div className="receipt-insights-header">

                <div>

                  <p className="section-eyebrow">
                    SMART ANALYSIS
                  </p>

                  <h2>
                    Smart Receipt Insights
                  </h2>

                  <p>
                    Scan a receipt to compare it with your existing spending across SplitFlow groups.
                  </p>

                </div>

                <button
                  type="button"
                  className="receipt-insights-close"
                  onClick={
                    closeReceiptInsights
                  }
                >
                  ×
                </button>

              </div>

              {!receiptInsightResult && (

                <>

                  <label className="receipt-dashboard-upload">

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      capture="environment"
                      hidden
                      onChange={
                        handleReceiptInsightFile
                      }
                    />

                    <span className="receipt-dashboard-upload-icon">
                      📷
                    </span>

                    <strong>
                      {receiptInsightFile
                        ? "Choose another receipt"
                        : "Choose or take a receipt photo"}
                    </strong>

                    <small>
                      PNG, JPG or WebP
                    </small>

                  </label>

                  {receiptInsightFile && (

                    <>

                      <div className="receipt-dashboard-file">
                        <span>
                          🧾
                        </span>

                        <div>
                          <strong>
                            {receiptInsightFile.name}
                          </strong>

                          <small>
                            Ready to analyse
                          </small>
                        </div>
                      </div>

                      {receiptInsightPreview && (

                        <div className="receipt-dashboard-preview">

                          <img
                            src={
                              receiptInsightPreview
                            }
                            alt="Receipt preview"
                          />

                        </div>

                      )}

                      <button
                        type="button"
                        className="primary-btn receipt-analyse-btn"
                        disabled={
                          scanningReceiptInsight
                        }
                        onClick={
                          handleAnalyseReceipt
                        }
                      >
                        {scanningReceiptInsight
                          ? "Analysing Receipt..."
                          : "Analyse Receipt"}
                      </button>

                    </>

                  )}

                </>

              )}

              {scanningReceiptInsight && (

                <div className="receipt-insights-loading">

                  <div className="loading-spinner" />

                  <div>
                    <strong>
                      Reading receipt...
                    </strong>

                    <span>
                      Calculating spending statistics
                    </span>
                  </div>

                </div>

              )}

              {receiptInsightResult &&
                receiptInsightStats && (

                <div className="receipt-insights-results">

                  <div className="receipt-insights-merchant">

                    <div>

                      <span>
                        RECEIPT DETECTED
                      </span>

                      <h3>
                        {receiptInsightResult.merchant ||
                          "Unknown merchant"}
                      </h3>

                      <p>
                        {receiptInsightResult.date ||
                          "Date not detected"}{" "}
                        •{" "}
                        {receiptInsightResult.category}
                      </p>

                    </div>

                    <strong>
                      RM{" "}
                      {Number(
                        receiptInsightResult.total ||
                          0
                      ).toFixed(2)}
                    </strong>

                  </div>

                  <div className="receipt-insight-stat-grid">

                    <div className="receipt-insight-stat">
                      <span>
                        This Receipt
                      </span>

                      <strong>
                        RM{" "}
                        {receiptInsightStats.receiptTotal.toFixed(
                          2
                        )}
                      </strong>

                      <small>
                        {receiptInsightStats.itemCount}{" "}
                        detected{" "}
                        {receiptInsightStats.itemCount ===
                        1
                          ? "item"
                          : "items"}
                      </small>
                    </div>

                    <div className="receipt-insight-stat">
                      <span>
                        {receiptInsightStats.receiptCategory} This Month
                      </span>

                      <strong>
                        RM{" "}
                        {receiptInsightStats.newCategoryTotal.toFixed(
                          2
                        )}
                      </strong>

                      <small>
                        Including this receipt
                      </small>
                    </div>

                    <div className="receipt-insight-stat">
                      <span>
                        Monthly Spend
                      </span>

                      <strong>
                        RM{" "}
                        {receiptInsightStats.newMonthTotal.toFixed(
                          2
                        )}
                      </strong>

                      <small>
                        If this receipt is added
                      </small>
                    </div>

                    <div className="receipt-insight-stat">
                      <span>
                        Category Share
                      </span>

                      <strong>
                        {receiptInsightStats.categoryShare.toFixed(
                          1
                        )}
                        %
                      </strong>

                      <small>
                        Of this month's spending
                      </small>
                    </div>

                  </div>

                  <div className="receipt-smart-insights">

                    <h3>
                      SplitFlow Insights
                    </h3>

                    <div className="receipt-smart-insight">
                      <span>
                        💡
                      </span>

                      <p>
                        This receipt would bring your{" "}
                        <strong>
                          {receiptInsightStats.receiptCategory}
                        </strong>{" "}
                        spending this month to{" "}
                        <strong>
                          RM{" "}
                          {receiptInsightStats.newCategoryTotal.toFixed(
                            2
                          )}
                        </strong>
                        .
                      </p>
                    </div>

                    <div className="receipt-smart-insight">
                      <span>
                        📊
                      </span>

                      <p>
                        Your average{" "}
                        <strong>
                          {receiptInsightStats.receiptCategory}
                        </strong>{" "}
                        expense would be about{" "}
                        <strong>
                          RM{" "}
                          {receiptInsightStats.categoryAverage.toFixed(
                            2
                          )}
                        </strong>
                        .
                      </p>
                    </div>

                    {receiptInsightStats.monthChange !==
                      null && (

                      <div className="receipt-smart-insight">
                        <span>
                          {receiptInsightStats.monthChange >=
                          0
                            ? "📈"
                            : "📉"}
                        </span>

                        <p>
                          {receiptInsightStats.receiptCategory} spending is{" "}
                          <strong>
                            {Math.abs(
                              receiptInsightStats.monthChange
                            ).toFixed(1)}
                            %
                          </strong>{" "}
                          {receiptInsightStats.monthChange >=
                          0
                            ? "higher"
                            : "lower"}{" "}
                          than last month.
                        </p>
                      </div>

                    )}

                    {receiptInsightStats.previousCategoryTotal ===
                      0 && (

                      <div className="receipt-smart-insight">
                        <span>
                          🆕
                        </span>

                        <p>
                          No{" "}
                          <strong>
                            {receiptInsightStats.receiptCategory}
                          </strong>{" "}
                          spending was recorded last month, so there is no previous-month comparison yet.
                        </p>
                      </div>

                    )}

                  </div>

                  <div className="receipt-breakdown">

                    <div>
                      <span>
                        Subtotal
                      </span>

                      <strong>
                        RM{" "}
                        {receiptInsightResult.subtotal.toFixed(
                          2
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Tax
                      </span>

                      <strong>
                        RM{" "}
                        {receiptInsightResult.tax.toFixed(
                          2
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Service Charge
                      </span>

                      <strong>
                        RM{" "}
                        {receiptInsightResult.serviceCharge.toFixed(
                          2
                        )}
                      </strong>
                    </div>

                  </div>

                  {receiptInsightResult.items.length >
                    0 && (

                    <div className="receipt-dashboard-items">

                      <h3>
                        Detected Items
                      </h3>

                      {receiptInsightResult.items.map(
                        (
                          item,
                          index
                        ) => (

                          <div
                            className="receipt-dashboard-item"
                            key={
                              `${item.name}-${index}`
                            }
                          >
                            <div>
                              <strong>
                                {item.name}
                              </strong>

                              <span>
                                Qty{" "}
                                {Number(
                                  item.quantity ||
                                    1
                                )}
                              </span>
                            </div>

                            <strong>
                              RM{" "}
                              {Number(
                                item.totalPrice ||
                                  item.unitPrice ||
                                  0
                              ).toFixed(2)}
                            </strong>
                          </div>

                        )
                      )}

                    </div>

                  )}

                  <div className="receipt-insights-actions">

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={
                        resetReceiptInsights
                      }
                    >
                      Scan Another
                    </button>

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={
                        closeReceiptInsights
                      }
                    >
                      Done
                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

        )}



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



                {loadingAnalytics

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



        {/* SPENDING OVERVIEW */}



        <section className="spending-overview">



          <div className="analytics-heading">



            <div>



              <p className="section-eyebrow">

                ANALYTICS

              </p>



              <h2>

                Spending Overview

              </h2>



              <p>

                Understand how your

                shared expenses are

                changing over time.

              </p>



            </div>



          </div>



          {/* TOP SPENDING INSIGHT */}



          <div className="spending-insight-card">



            {loadingAnalytics ? (



              <div className="spending-insight-loading">

                Loading spending insight...

              </div>



            ) : topCategory ? (



              <>



                <div className="spending-insight-icon">

                  📈

                </div>



                <div className="spending-insight-main">



                  <span className="spending-insight-eyebrow">

                    TOP SPENDING CATEGORY

                  </span>



                  <h3>

                    {topCategory.category}

                  </h3>



                  <p>

                    This is your highest

                    spending category

                    across all groups.

                  </p>



                </div>



                <div className="spending-insight-stats">



                  <strong>

                    RM{" "}

                    {Number(

                      topCategory.total

                    ).toFixed(2)}

                  </strong>



                  <span>

                    {

                      topCategoryPercentage

                    }

                    % of total spending

                  </span>



                </div>



              </>



            ) : (



              <div className="spending-insight-loading">

                Add expenses to see

                your top spending

                category.

              </div>



            )}



          </div>



          {/* ANALYTICS CHARTS */}



          <div className="analytics-grid">



            <div className="analytics-card">



              <div className="analytics-card-header">



                <div>



                  <span className="analytics-card-label">

                    LAST 6 MONTHS

                  </span>



                  <h3>

                    Monthly Spending

                  </h3>



                </div>



                <span className="analytics-total">



                  RM{" "}



                  {monthlyChart

                    .reduce(

                      (

                        total,

                        month

                      ) =>

                        total +

                        month.total,

                      0

                    )

                    .toFixed(2)}



                </span>



              </div>



              {loadingAnalytics ? (



                <div className="analytics-empty">

                  Loading analytics...

                </div>



              ) : monthlyChart.every(

                  (month) =>

                    month.total ===

                    0

                ) ? (



                <div className="analytics-empty">

                  No spending data yet.

                </div>



              ) : (



                <div className="monthly-chart">



                  {monthlyChart.map(

                    (month) => {



                      const height =

                        Math.max(

                          (

                            month.total /

                            maxMonthlyValue

                          ) *

                            100,

                          month.total >

                            0

                            ? 8

                            : 0

                        );



                      return (



                        <div

                          className="month-column"

                          key={`${month.year}-${month.month}`}

                        >



                          <div className="month-amount">



                            {month.total >

                            0

                              ? `RM ${month.total.toFixed(

                                  0

                                )}`

                              : ""}



                          </div>



                          <div className="month-bar-area">



                            <div

                              className="month-bar"

                              style={{

                                height:

                                  `${height}%`,

                              }}

                            />



                          </div>



                          <span>

                            {

                              month.label

                            }

                          </span>



                        </div>



                      );

                    }

                  )}



                </div>



              )}



            </div>



            <div className="analytics-card">



              <div className="analytics-card-header">



                <div>



                  <span className="analytics-card-label">

                    BREAKDOWN

                  </span>



                  <h3>

                    Spending by Category

                  </h3>



                </div>



              </div>



              {loadingAnalytics ? (



                <div className="analytics-empty">

                  Loading analytics...

                </div>



              ) : categoryChart.length ===

                0 ? (



                <div className="analytics-empty">

                  No category data yet.

                </div>



              ) : (



                <div className="category-chart">



                  {categoryChart.map(

                    (item) => {



                      const width =

                        (

                          item.total /

                          maxCategoryValue

                        ) *

                        100;



                      return (



                        <div

                          className="category-row"

                          key={

                            item.category

                          }

                        >



                          <div className="category-row-top">



                            <span>

                              {

                                item.category

                              }

                            </span>



                            <strong>



                              RM{" "}



                              {item.total.toFixed(

                                2

                              )}



                            </strong>



                          </div>



                          <div className="category-track">



                            <div

                              className="category-fill"

                              style={{

                                width:

                                  `${width}%`,

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



          ) : recentActivities.length ===

            0 ? (



            <div className="activity-empty">



              <div className="activity-empty-icon">

                ◷

              </div>



              <strong>

                No activity yet

              </strong>



              <span>

                Group activity will

                appear here.

              </span>



            </div>



          ) : (



            <div className="activity-list">



              {recentActivities.map(

                (activity) => (



                  <div

                    className="activity-item"

                    key={`${activity.groupId}-${activity.id}`}

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

              groups.length >

                0 && (



                <span className="group-count-badge">



                  {groups.length}{" "}



                  {groups.length ===

                  1

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

            groups.length ===

              0 && (



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

            groups.length >

              0 && (



              <div className="group-card-grid">



                {groups.map(

                  (group) => {



                    const isOwner =

                      group.createdByEmail

                        ?.toLowerCase() ===

                      userEmail

                        ?.toLowerCase();



                    const budget =

                      Number(

                        group.budget ||

                          0

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

                              ?.charAt(

                                0

                              )

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



      {/* =====================================================

          DELETE ACCOUNT MODAL

          ===================================================== */}



      {showDeleteModal && (



        <div

          className="delete-account-overlay"

          onMouseDown={(e) => {

            if (

              e.target ===

              e.currentTarget

            ) {

              closeDeleteModal();

            }

          }}

        >



          <div className="delete-account-modal">



            <div className="delete-account-warning-icon">

              !

            </div>



            <h2>

              Delete your account?

            </h2>



            <p className="delete-account-description">

              This action permanently

              deletes your SplitFlow

              account and cannot be

              undone.

            </p>



            <div className="delete-account-notice">



              <strong>

                Before you continue

              </strong>



              <span>

                You cannot delete your

                account while you still

                own a group. Delete or

                transfer ownership of

                your groups first.

              </span>



            </div>



            <label

              className="delete-confirm-label"

              htmlFor="delete-confirmation"

            >

              Type{" "}

              <strong>

                DELETE

              </strong>{" "}

              to confirm

            </label>



            <input

              id="delete-confirmation"

              type="text"

              className="delete-confirm-input"

              placeholder="DELETE"

              value={

                deleteConfirmation

              }

              disabled={

                deletingAccount

              }

              autoComplete="off"

              onChange={(e) => {

                setDeleteConfirmation(

                  e.target.value

                );



                setDeleteError(

                  ""

                );

              }}

            />



            {deleteError && (



              <div className="delete-account-error">

                {deleteError}

              </div>



            )}



            <div className="delete-account-actions">



              <button

                type="button"

                className="delete-cancel-btn"

                onClick={

                  closeDeleteModal

                }

                disabled={

                  deletingAccount

                }

              >

                Cancel

              </button>



              <button

                type="button"

                className="delete-confirm-btn"

                onClick={

                  handleDeleteAccount

                }

                disabled={

                  deletingAccount ||

                  deleteConfirmation !==

                    "DELETE"

                }

              >

                {deletingAccount

                  ? "Deleting..."

                  : "Delete Account"}

              </button>



            </div>



          </div>



        </div>



      )}




      {/* SPLITFLOW ASSISTANT */}

      <button
        type="button"
        className="splitflow-assistant-fab"
        aria-label="Open SplitFlow Assistant"
        onClick={() =>
          setShowAssistant(
            (current) =>
              !current
          )
        }
      >
        {showAssistant
          ? "×"
          : "🤖"}
      </button>

      {showAssistant && (

        <div className="splitflow-assistant-panel">

          <div className="assistant-header">

            <div className="assistant-avatar">
              🤖
            </div>

            <div>
              <strong>
                SplitFlow Assistant
              </strong>

              <span>
                Powered by Gemini • Uses your SplitFlow data
              </span>
            </div>

            <button
              type="button"
              className="assistant-header-close"
              onClick={() =>
                setShowAssistant(
                  false
                )
              }
            >
              ×
            </button>

          </div>

          <div className="assistant-suggestions">

            {assistantSuggestions.map(
              (suggestion) => (

                <button
                  type="button"
                  key={
                    suggestion
                  }
                  onClick={() =>
                    sendAssistantMessage(
                      suggestion ===
                      "This month"
                        ? "How much did I spend this month?"
                        : suggestion ===
                            "Top category"
                          ? "What is my biggest category?"
                          : suggestion ===
                              "Largest expense"
                            ? "What was my largest expense?"
                            : "Compare this month with last month"
                    )
                  }
                >
                  {suggestion}
                </button>

              )
            )}

          </div>

          <div className="assistant-messages">

            {assistantMessages.map(
              (
                message,
                index
              ) => (

                <div
                  key={
                    `${message.role}-${index}`
                  }
                  className={`assistant-message ${message.role}`}
                >
                  {message.role ===
                    "assistant" && (
                    <span className="assistant-message-avatar">
                      🤖
                    </span>
                  )}

                  <div>

                    <div>
                      {message.text}
                    </div>

                    {message.role ===
                      "assistant" &&
                      message.provider && (

                      <small className="assistant-provider-label">
                        {message.provider ===
                        "gemini"
                          ? "Gemini"
                          : "Local fallback"}
                      </small>

                    )}

                  </div>
                </div>

              )
            )}

            {assistantTyping && (

              <div className="assistant-message assistant">

                <span className="assistant-message-avatar">
                  🤖
                </span>

                <div className="assistant-typing-bubble">
                  <span />
                  <span />
                  <span />
                </div>

              </div>

            )}

          </div>

          <form
            className="assistant-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              sendAssistantMessage();
            }}
          >
            <input
              type="text"
              value={
                assistantInput
              }
              placeholder="Ask about your spending..."
              onChange={(event) =>
                setAssistantInput(
                  event.target.value
                )
              }
            />

            <button
              type="submit"
              disabled={
                !assistantInput.trim()
              }
            >
              ➤
            </button>
          </form>

          <div className="assistant-footer">
            AI responses may fall back to local analysis if Gemini is unavailable.
          </div>

        </div>

      )}


    </div>

  );

}



export default Dashboard;