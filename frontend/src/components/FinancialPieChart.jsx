import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#4ade80", "#f87171", "#60a5fa"]; // Income, Expense, Balance

const FinancialPieChart = ({ totalIncome, totalExpense, totalBalance }) => {
  const data = [
    { name: "Total Income", value: totalIncome },
    { name: "Total Expenses", value: totalExpense },
    { name: "Total Balance", value: totalBalance },
  ];

  return (
    <div className="w-full h-64 md:h-80 my-4">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={(entry) => `${entry.name}: ${entry.value}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value}`} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialPieChart;
