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

  const { data: incomeData, refetch: refetchIncomes } =
    useGetAllIncomesQuery();
  const { data: expenseData, refetch: refetchExpenses } =
    useGetAllExpensesQuery();

  const fetchData = async () => {
    try {
      await refetchIncomes();
      await refetchExpenses();

      const incomeTotal = incomeData?.totalIncome || 0;
      const expenseTotal = expenseData?.totalExpense || 0;

      setTotalIncome(incomeTotal);
      setTotalExpense(expenseTotal);
      setTotalBalance(incomeTotal - expenseTotal);

      // ✅ SORT BY DATE DESC & TAKE LATEST 4
      const sortedIncomes = [...(incomeData?.incomes || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);

      const sortedExpenses = [...(expenseData?.expenses || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);

      setRecentIncomes(sortedIncomes);
      setRecentExpenses(sortedExpenses);
    } catch (error) {
      console.log(error);
      toast.error(
        error?.data?.error || "Unexpected Internal Server Error!"
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, [incomeData, expenseData]);

  // ================== ACTIVITY CHART DATA ==================
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
            <h4 className="font-outfit text-base md:text-lg">Total Balance</h4>
            <h4 className="text-2xl md:text-3xl mt-1">
              $
              <NumericFormat
                className="ml-1 text-xl md:text-2xl"
                value={totalBalance}
                displayType={"text"}
                thousandSeparator={true}
              />
            </h4>
          </div>
          <Balance className="icon" />
        </div>

        <div className="px-6 py-4 border-2 w-full sm:w-[30%] border-secondary rounded-lg flex justify-between items-center bg-white shadow-md">
          <div>
            <h4 className="font-outfit text-base md:text-lg">Total Incomes</h4>
            <h4 className="text-2xl md:text-3xl text-emerald-400 mt-1">
              $
              <NumericFormat
                className="ml-1 text-xl md:text-2xl"
                value={totalIncome}
                displayType={"text"}
                thousandSeparator={true}
              />
            </h4>
          </div>
          <Income className="icon" />
        </div>

        <div className="px-6 py-4 border-2 w-full sm:w-[30%] border-secondary rounded-lg flex justify-between items-center bg-white shadow-md">
          <div>
            <h4 className="font-outfit text-base md:text-lg">Total Expenses</h4>
            <h4 className="text-2xl md:text-3xl text-red-400 mt-1">
              $
              <NumericFormat
                className="ml-1 text-xl md:text-2xl"
                value={totalExpense}
                displayType={"text"}
                thousandSeparator={true}
              />
            </h4>
          </div>
          <Expense className="icon" />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full mt-8 flex flex-col md:flex-row gap-6">
        {/* LEFT */}
        <div className="w-full md:w-2/3 flex flex-col gap-8">
          <div className="bg-white p-4 rounded-lg shadow-md h-[28rem]">
            <h5 className="text-2xl mb-4 font-semibold">
              Activity
            </h5>
            <Chart data={chartData} />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md h-[26rem]">
            <h5 className="text-2xl mb-4 font-semibold">
              Financial Summary
            </h5>
            <FinancialPieChart
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              totalBalance={totalBalance}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          {/* RECENT INCOMES */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between mb-4">
              <h5 className="text-xl font-semibold">
                Recent Incomes
              </h5>
              <button
                onClick={() => navigate("/dashboard/incomes")}
                className="text-primary font-semibold"
              >
                See All
              </button>
            </div>

            {recentIncomes.length === 0 ? (
              <p className="text-gray-500">
                No recent incomes
              </p>
            ) : (
              <ul className="space-y-4">
                {recentIncomes.map((i) => (
                  <li
                    key={i._id}
                    className="transaction-item"
                  >
                    <div className="flex gap-3">
                      <Income className="icon-second" />
                      <div>
                        <p className="capitalize">
                          {i.title}
                        </p>
                        <span className="text-sm text-gray-500">
                          {moment(i.date).format(
                            "MM/DD/YYYY"
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-semibold">
                      ${i.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* RECENT EXPENSES */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between mb-4">
              <h5 className="text-xl font-semibold">
                Recent Expenses
              </h5>
              <button
                onClick={() => navigate("/dashboard/expenses")}
                className="text-primary font-semibold"
              >
                See All
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <p className="text-gray-500">
                No recent expenses
              </p>
            ) : (
              <ul className="space-y-4">
                {recentExpenses.map((e) => (
                  <li
                    key={e._id}
                    className="transaction-item"
                  >
                    <div className="flex gap-3">
                      <Expense className="icon-second" />
                      <div>
                        <p className="capitalize">
                          {e.title}
                        </p>
                        <span className="text-sm text-gray-500">
                          {moment(e.date).format(
                            "MM/DD/YYYY"
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="text-red-400 font-semibold">
                      ${e.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
