import asyncHandler from "../middlewares/asyncHandler.js";
import { GoogleGenAI } from "@google/genai";
import Expense from "../models/expenseModel.js";
import Income from "../models/incomeModel.js";
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

  // 🔹 Fetch user data
  const expenses = await Expense.find({ user: userId });
  const incomes = await Income.find({ user: userId });

  // 🔹 Calculate totals
  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalIncome = incomes.reduce((acc, i) => acc + i.amount, 0);

  // 🔹 Build smart prompt
  const prompt = `
You are a personal finance assistant.

User question: ${message}

User financial data:
- Total Income: ${totalIncome}
- Total Expense: ${totalExpense}

Expenses breakdown:
${expenses.map(e => `- ${e.title}: ${e.amount} (${e.category})`).join("\n")}

Incomes breakdown:
${incomes.map(i => `- ${i.title}: ${i.amount} (${i.category})`).join("\n")}

Instructions:
- Answer clearly
- Be helpful and short
- Give financial advice if possible
`;

  // 🔹 AI response
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return res.status(200).json({
    reply: response.text,
    summary: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    },
  });
});