import asyncHandler from "../middlewares/asyncHandler.js";
import { GoogleGenAI } from "@google/genai";
import Expense from "../models/expenseModel.js";
import Income from "../models/incomeModel.js";
import User from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const chatWithAI = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user._id;

  if (!message) {
    return res.status(400).json({ error: "Message is required!" });
  }

  // ================= DATA FETCH =================
  const user = await User.findById(userId);
  const expenses = await Expense.find({ user: userId });
  const incomes = await Income.find({ user: userId });

  // ================= TOTALS =================
  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalIncome = incomes.reduce((acc, i) => acc + i.amount, 0);
  const balance = totalIncome - totalExpense;

  const budgetLimit = user?.budgetLimit || 0;
  const remainingBudget = budgetLimit - totalExpense;

  // ================= CATEGORY ANALYSIS =================
  const categoryMap = {};

  expenses.forEach((e) => {
    if (!categoryMap[e.category]) {
      categoryMap[e.category] = 0;
    }
    categoryMap[e.category] += e.amount;
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([cat, amt]) => {
      const percent = totalExpense ? ((amt / totalExpense) * 100).toFixed(1) : 0;
      return `${cat}: ${amt} (${percent}%)`;
    })
    .join("\n");

  const topCategory =
    Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

  const isOverBudget = budgetLimit > 0 && totalExpense > budgetLimit;

  // ================= SMART PROMPT =================
  const prompt = `
You are a highly intelligent personal finance advisor.

User question:
${message}

================= USER FINANCIAL OVERVIEW =================
Total Income: ${totalIncome}
Total Expense: ${totalExpense}
Balance: ${balance}

Budget Limit: ${budgetLimit}
Remaining Budget: ${remainingBudget}
Budget Status: ${isOverBudget ? "OVER BUDGET" : "WITHIN BUDGET"}

Top Spending Category: ${topCategory}

================= CATEGORY BREAKDOWN =================
${categoryBreakdown || "No expenses yet"}

================= EXPENSE LIST =================
${expenses
  .map((e) => `- ${e.title}: ${e.amount} (${e.category})`)
  .join("\n")}

================= INCOME LIST =================
${incomes
  .map((i) => `- ${i.title}: ${i.amount} (${i.category})`)
  .join("\n")}

================= INSTRUCTIONS =================
- Be concise and practical
- Always consider budget limit
- Highlight overspending if present
- Suggest how to reduce spending in top categories
- Give actionable advice (not generic talk)
- If user is within budget, suggest savings improvement
- If over budget, suggest correction plan
`;

  // ================= AI RESPONSE =================
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return res.status(200).json({
    reply: response.text,
    summary: {
      totalIncome,
      totalExpense,
      balance,
      budgetLimit,
      remainingBudget,
      isOverBudget,
      topCategory,
    },
  });
});