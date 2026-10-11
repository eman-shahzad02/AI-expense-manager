# Spend Smart — AI-Based Expense Manager

A full-stack personal finance management web application developed as a Final Year Project, combining expense tracking, income management, budgeting, financial analytics, and an AI-powered chatbot.

## Project Overview

Spend Smart helps users organize their personal finances through an interactive dashboard and integrated financial management tools.

## Key Features

* **User Authentication:** Registration, login, email OTP verification, and password reset.
* **Expense Management:** Add, edit, delete, categorize, and review expenses.
* **Income Management:** Track multiple income sources and view income records.
* **Budget Planning:** Set category-wise spending limits and monitor budget usage.
* **Financial Analytics:** Explore income, expenses, balance summaries, and financial trends through interactive charts.
* **Excel Reports:** Export financial records for offline analysis.
* **AI-Powered Chatbot:** An integrated chatbot designed to answer financial queries and provide financial guidance.
* **Responsive Interface:** Interactive navigation, notifications, and animated UI elements.

## Technology Stack

**Frontend**

* React.js
* React Router DOM
* Redux Toolkit
* Tailwind CSS and NextUI
* Recharts
* Framer Motion

**Backend**

* Node.js and Express.js
* MongoDB and Mongoose
* JWT authentication
* bcryptjs
* Nodemailer and OTP Generator

**Additional Tools**

* Git and GitHub
* Environment variables managed through dotenv

## AI Integration

## AI-Powered Financial Assistant

Spend Smart integrates Google's Gemini AI to provide personalized financial guidance based on a user's recorded financial data.

### How It Works

* Retrieves the authenticated user's income and expense records.
* Calculates total income, total expenses, balance, and remaining budget.
* Analyzes spending by category and identifies the highest-spending category.
* Provides the AI model with a financial summary and the user's question.
* Generates practical suggestions related to budgeting, spending habits, and savings.

### Technical Implementation

* Google Gen AI SDK (`@google/genai`)
* Gemini model configured in the backend
* Node.js and Express.js
* MongoDB and Mongoose for financial data retrieval

The AI assistant is designed to provide contextual financial guidance using the user's recorded transactions and budget information.

## Project Learning Outcomes

* Working with a full-stack JavaScript application.
* Understanding REST API and database integration.
* Exploring authentication and user data management.
* Presenting financial information through charts and reports.
* Integrating an AI-assisted feature into a web application.

## Live Demo

[Explore Spend Smart](https://spend-smart-dev.vercel.app/)

## Author

**Eman Shahzad**
Computer Science | Artificial Intelligence | Data Analytics | Aspiring Data Scientist

I am a Computer Science student interested in Artificial Intelligence, data analytics, and data science. Through this project, I explored full-stack web development, financial data visualization, and the integration of a Gemini-powered AI assistant.

* GitHub: [eman-shahzad02](https://github.com/eman-shahzad02)

## Source Acknowledgement

This project was developed by adapting an existing codebase and extending its functionality. The project's original source and applicable license should be acknowledged appropriately. My contribution includes the AI-powered financial assistant integration and related project improvements.
