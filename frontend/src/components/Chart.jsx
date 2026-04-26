import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const Chart = ({
  data = [],                 // default empty array
  xKey = "name",             // default X axis key
  incomeKey = "income",      // default income key
  expenseKey = "expense",    // default expense key
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend align="center" verticalAlign="top" />
        <Line type="monotone" dataKey={incomeKey} stroke="#82ca9d" />
        <Line type="monotone" dataKey={expenseKey} stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Chart;
