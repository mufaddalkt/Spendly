# 💰 Spendly — Personal Finance & Budget Management Web App

**Spendly** is a production-quality, multi-user personal finance web application built with **Next.js 15**, **TypeScript**, **Zustand**, **Tailwind CSS / CSS Custom Properties**, and **Recharts**.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Spendly-6366f1?logo=github)](https://github.com/mufaddalkt/Spendly)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)

---

## 🌟 Key Highlights

- 🔐 **Multi-User Authentication:** Sign Up, Sign In, Sign Out, protected routes, and user data isolation.
- ✨ **Clean Workspace Setup:** New user registrations start with a fresh $0 balance and default categories.
- ⚡ **Demo Login:** One-click instant login to explore populated sample analytics and reports.
- 🌍 **Global Currency Support:** Native `Intl.NumberFormat` supporting **40+ global currencies** (USD, EUR, GBP, JPY, CAD, AUD, CHF, INR, AED, SAR, BRL, CNY, MXN, and more).
- 📊 **Rich Financial Visualizations:** 6-month cash flow bar/line charts, spending category donuts, dual-gradient trend areas, and budget health indicators.
- 📱 **Responsive & Accessible:** Dark, Light, and System theme modes with smooth transitions.

---

## 📌 Page Breakdown & Features

### 1. Dashboard (`/`)
- Financial overview cards: Balance, Income, Expenses, Savings.
- Interactive Cash Flow (6 months) & Spending category donut chart.
- Category budget progress bars & status indicators.
- Recent transaction feed and upcoming payments due within 30 days.

### 2. Transactions (`/transactions`)
- Multi-criteria filtering (Type, Category, Payment Method, Date Range).
- Instant text search across descriptions, categories, and notes.
- Multi-column sorting (Date, Amount, Description, Category) and 25-item pagination.
- Add, Edit, Duplicate, and Bulk Delete transactions with confirmation dialogs.
- Instant CSV export.

### 3. Budgets (`/budgets`)
- Month-by-month budget navigator.
- Category spending limit management.
- Budget vs. actual spending bar chart.
- Status badges: *On Track*, *Warning (≥80%)*, *Over Budget (≥100%)*.

### 4. Analytics (`/analytics`)
- Time horizon selector (7D, 30D, 3M, 6M, 1Y).
- Dual-gradient area trend charts.
- Category breakdown table & pie chart.
- Top expenses leaderboard.
- Automated financial insight recommendations.

### 5. Recurring Expenses (`/recurring`)
- Track subscriptions and regular bills (Weekly, Monthly, Quarterly, Yearly).
- Automatic next payment date calculation & days remaining.
- Pause / Resume recurring expenses.
- 30-day payment reminder panel.

### 6. Savings Goals (`/goals`)
- Target goal progress cards with saved vs. remaining calculations.
- Quick deposit and withdrawal modal dialogs.
- Milestone badges (25%, 50%, 75%, 100%).
- Custom color swatch and icon selectors.

### 7. Calendar (`/calendar`)
- Monthly calendar grid displaying daily income (green) and expenses (red).
- Spending heatmap intensity shading.
- Day inspector side panel showing full daily transactions and net total.

### 8. Settings (`/settings`)
- User profile manager.
- 40+ global currencies selector.
- Date format & week start day preferences.
- Theme mode switcher (Light, Dark, System).
- Custom category manager (Add, Edit, Delete categories with icons & colors).
- Data controls: Export CSV & Reset data.

---

## 🛠 Technology Stack

- **Framework:** Next.js 15 (App Router with Turbopack)
- **State Store:** Zustand with `localStorage` persistence
- **Language:** TypeScript
- **Styling:** CSS Custom Properties + Tailwind CSS v4
- **Charts:** Recharts
- **Icons & UI:** Lucide React & Sonner Toasts

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/mufaddalkt/Spendly.git
cd Spendly
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

MIT License. Free to use and modify for personal and commercial projects.
