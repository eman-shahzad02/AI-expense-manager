import React, { useState, useEffect } from "react";
import Chart from "../../components/Chart";
import FinancialPieChart from "../../components/FinancialPieChart";
import { useSelector } from "react-redux";
import moment from "moment";
import { toast } from "react-toastify";
import { NumericFormat } from "react-number-format";
import { useNavigate } from "react-router-dom";

import { Income, Expense, Balance } from "../../utils/Icons";
import { useGetAllIncomesQuery } from "../../features/api/apiSlices/incomeApiSlice";
import { useGetAllExpensesQuery } from "../../features/api/apiSlices/expenseApiSlice";

const DashboardPage = () => {
  const user = useSelector((state) => state.auth.user.username);
  const navigate = useNavigate();

  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const [recentIncomes, setRecentIncomes] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);

  // ================= BUDGET STATES (ADDED ONLY) =================
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [budgetInput, setBudgetInput] = useState("");
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [loadingBudget, setLoadingBudget] = useState(false);

  const { data: incomeData, refetch: refetchIncomes } =
    useGetAllIncomesQuery();
  const { data: expenseData, refetch: refetchExpenses } =
    useGetAllExpensesQuery();

  // ================= FETCH USER =================
  const fetchUserBudget = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/users", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setBudgetLimit(data?.user?.budgetLimit || 0);
        setBudgetInput(data?.user?.budgetLimit || 0);
      }
    } catch (error) {
      toast.error("Failed to load budget");
    }
  };

  const fetchData = async () => {
    try {
      await refetchIncomes();
      await refetchExpenses();

      const incomeTotal = incomeData?.totalIncome || 0;
      const expenseTotal = expenseData?.totalExpense || 0;

      setTotalIncome(incomeTotal);
      setTotalExpense(expenseTotal);
      setTotalBalance(incomeTotal - expenseTotal);

      const sortedIncomes = [...(incomeData?.incomes || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);

      const sortedExpenses = [...(expenseData?.expenses || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);

      setRecentIncomes(sortedIncomes);
      setRecentExpenses(sortedExpenses);
    } catch (error) {
      toast.error(error?.data?.error || "Unexpected Internal Server Error!");
    }
  };

  useEffect(() => {
    fetchData();
    fetchUserBudget(); // ✅ added
  }, [incomeData, expenseData]);

  // ================= BUDGET LOGIC =================
  const budgetUsedPercent =
    budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;

  const isBudgetExceeded =
    budgetLimit > 0 && totalExpense > budgetLimit;

  useEffect(() => {
    if (isBudgetExceeded) {
      toast.warning("⚠️ Budget exceeded!");
    }
  }, [isBudgetExceeded]);

  // ================= UPDATE BUDGET =================
  const handleBudgetUpdate = async () => {
    if (!budgetInput || Number(budgetInput) < 0) {
      toast.error("Enter valid budget");
      return;
    }

    try {
      setLoadingBudget(true);

      const res = await fetch("http://localhost:3000/api/v1/users/budget", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          budgetLimit: Number(budgetInput),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setBudgetLimit(data.budgetLimit);
        toast.success("Budget updated successfully!");
        setShowBudgetModal(false);
      } else {
        toast.error(data.error || "Failed to update budget");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoadingBudget(false);
    }
  };

  // ================= ACTIVITY CHART DATA =================
  const incomeDates =
    incomeData?.incomes.map((i) =>
      moment(i.date).format("MM/DD/YYYY")
    ) || [];

  const incomeAmounts =
    incomeData?.incomes.map((i) => i.amount) || [];

  const expenseAmounts =
    expenseData?.expenses.map((e) => e.amount) || [];

  let chartData = [];

  if (incomeAmounts.length === 0 || expenseAmounts.length === 0) {
    chartData = [
      {
        name: "Add income & expenses to see activity",
        income: 0,
        expense: 0,
      },
    ];
  } else {
    chartData = incomeDates.map((date, index) => ({
      name: date,
      income: incomeAmounts[index] || 0,
      expense: expenseAmounts[index] || 0,
    }));
  }

  return (
    <section className="w-full h-full md:h-[90vh] px-3 md:px-6">

      {/* Greeting */}
      <h2 className="text-2xl md:text-3xl lg:text-4xl mt-3">
        Hello, {user} 😊
      </h2>

      <p className="text-gray-600">
        See what’s happening with your money —{" "}
        <span className="font-semibold text-primary">
          Spend Smartly!
        </span>
      </p>

      {/* SUMMARY CARDS */}
      <div className="w-full mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">

        <div className="px-6 py-4 border-2 w-full sm:w-[30%] border-secondary rounded-lg flex justify-between items-center bg-white shadow-md">
          <div>
            <h4>Total Balance</h4>
            <h4 className="text-2xl md:text-3xl mt-1">
              $<NumericFormat value={totalBalance} displayType="text" thousandSeparator />
            </h4>
          </div>
          <Balance className="icon" />
        </div>

        <div className="px-6 py-4 border-2 w-full sm:w-[30%] border-secondary rounded-lg flex justify-between items-center bg-white shadow-md">
          <div>
            <h4>Total Incomes</h4>
            <h4 className="text-2xl text-emerald-400 mt-1">
              $<NumericFormat value={totalIncome} displayType="text" thousandSeparator />
            </h4>
          </div>
          <Income className="icon" />
        </div>

        <div className="px-6 py-4 border-2 w-full sm:w-[30%] border-secondary rounded-lg flex justify-between items-center bg-white shadow-md">
          <div>
            <h4>Total Expenses</h4>
            <h4 className="text-2xl text-red-400 mt-1">
              $<NumericFormat value={totalExpense} displayType="text" thousandSeparator />
            </h4>
          </div>
          <Expense className="icon" />
        </div>

        {/* ================= BUDGET CARD (ADDED ONLY) ================= */}
        <div className="px-6 py-4 border-2 w-full sm:w-[30%] border-secondary rounded-lg bg-white shadow-md">

          <div className="flex justify-between items-center">
            <h4>Budget</h4>
            <button
              onClick={() => setShowBudgetModal(true)}
              className="text-primary text-sm"
            >
              Edit
            </button>
          </div>

          <h4 className={`text-2xl mt-1 ${isBudgetExceeded ? "text-red-500" : "text-primary"}`}>
            ${budgetLimit}
          </h4>

          <p className="text-sm text-gray-500">
            {budgetUsedPercent.toFixed(1)}% used
          </p>

          <div className="w-full bg-gray-200 h-2 rounded mt-2">
            <div
              className={`h-2 rounded ${
                isBudgetExceeded ? "bg-red-500" : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(budgetUsedPercent, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full mt-8 flex flex-col md:flex-row gap-6">

        <div className="w-full md:w-2/3 flex flex-col gap-8">
          <div className="bg-white p-4 rounded-lg shadow-md h-[28rem]">
            <h5 className="text-2xl mb-4 font-semibold">Activity</h5>
            <Chart data={chartData} />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md h-[26rem]">
            <h5 className="text-2xl mb-4 font-semibold">Financial Summary</h5>
            <FinancialPieChart
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              totalBalance={totalBalance}
            />
          </div>
        </div>

        <div className="w-full md:w-1/3 flex flex-col gap-6">

          {/* RECENT INCOMES */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between mb-4">
              <h5 className="text-xl font-semibold">Recent Incomes</h5>
              <button
                onClick={() => navigate("/dashboard/incomes")}
                className="text-primary font-semibold"
              >
                See All
              </button>
            </div>

            <ul className="space-y-4">
              {recentIncomes.map((i) => (
                <li key={i._id} className="transaction-item">
                  <div className="flex gap-3">
                    <Income className="icon-second" />
                    <div>
                      <p className="capitalize">{i.title}</p>
                      <span className="text-sm text-gray-500">
                        {moment(i.date).format("MM/DD/YYYY")}
                      </span>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-semibold">
                    ${i.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* RECENT EXPENSES */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between mb-4">
              <h5 className="text-xl font-semibold">Recent Expenses</h5>
              <button
                onClick={() => navigate("/dashboard/expenses")}
                className="text-primary font-semibold"
              >
                See All
              </button>
            </div>

            <ul className="space-y-4">
              {recentExpenses.map((e) => (
                <li key={e._id} className="transaction-item">
                  <div className="flex gap-3">
                    <Expense className="icon-second" />
                    <div>
                      <p className="capitalize">{e.title}</p>
                      <span className="text-sm text-gray-500">
                        {moment(e.date).format("MM/DD/YYYY")}
                      </span>
                    </div>
                  </div>
                  <span className="text-red-400 font-semibold">
                    ${e.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ================= BUDGET MODAL (ADDED ONLY) ================= */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-[90%] md:w-[400px]">

            <h2 className="text-xl mb-4">Set Budget</h2>

            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="border w-full px-3 py-2 rounded"
              placeholder="Enter budget"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleBudgetUpdate}
                disabled={loadingBudget}
                className="bg-primary text-white px-4 py-2 rounded"
              >
                {loadingBudget ? "Saving..." : "Save"}
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};

export default DashboardPage;