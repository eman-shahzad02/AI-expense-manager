// src/components/Charts/IncomeBarChart.jsx
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const IncomeBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-center">No income data to display.</p>;
  }

  // Prepare last 7 income entries sorted by date
  const chartData = [...data]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7)
    .map((inc) => ({
      date: new Date(inc.date).toLocaleDateString(),
      amount: inc.amount,
    }));

  return (
    <div className="w-full h-80 border-2 border-secondary rounded-lg p-4 mb-8">
      <h4 className="text-2xl mb-4 text-center font-semibold">Income Summary</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value}`} />
          <Bar dataKey="amount" fill="#34D399" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeBarChart;
