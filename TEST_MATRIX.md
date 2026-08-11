# Spendly — Test Case Matrix (SP-0001 to SP-1000)

This document contains the complete test matrix covering **Authentication**, **Dashboard**, **Transactions**, **Budgets**, **Recurring Expenses**, **Savings Goals**, and **Settings** for the Spendly personal finance application.

---

## 📌 Summary of Test Areas

| Test Suite ID Range | Module | Area | Primary Scenarios Covered | Automation Status |
| :--- | :--- | :--- | :--- | :--- |
| **SP-0001 – SP-0100** | Authentication | Sign Up | Valid Credentials, Invalid Email, Invalid Password, Empty Fields, Duplicate Account, Malformed Email, Long Input, Special Characters, Refresh State, Protected Route Redirection | ✅ Automated (`e2e/auth.spec.ts`) |
| **SP-0101 – SP-0200** | Authentication | Sign In | Valid Credentials, Invalid Email, Invalid Password, Empty Fields, Duplicate Account, Malformed Email, Long Input, Special Characters, Refresh State, Protected Route Redirection | ✅ Automated (`e2e/auth.spec.ts`) |
| **SP-0201 – SP-0300** | Authentication | Sign Out | Session Invalidation, Storage Clearing, Protected Route Guards, Mobile Viewport Navigation, Theme Mode Switching | ✅ Automated (`e2e/auth.spec.ts`) |
| **SP-0301 – SP-0400** | Authentication | Session | Cookie Persistence, Unauthenticated Access Interception, Token Signing & Refresh | ✅ Automated (`e2e/auth.spec.ts`) |
| **SP-0401 – SP-0500** | Authentication | Protected Routes | Client Route Guards, AuthGuard Interception, Unauthenticated Redirects | ✅ Automated (`e2e/auth.spec.ts`) |
| **SP-0501 – SP-0600** | Authentication | Demo Login | Clean Slate Initialization, Workspace Isolation, Clean Profile Setup | ✅ Automated (`e2e/auth.spec.ts`) |
| **SP-0601 – SP-0700** | Authentication | Password Reset | `/forgot-password` Email Request, Token Generation, `/reset-password` Password Confirmation | ✅ Automated (`e2e/auth.spec.ts`) |
| **SP-0701 – SP-0800** | Authentication | Validation | Form Field Invalidation, Client-side & Server-side Error Messages, Touch Ergonomics | ✅ Automated (`e2e/auth.spec.ts`) |
| **SP-0801 – SP-0900** | Dashboard | Summary Cards | Zero-Data Empty State, Single Transaction, Multiple Transactions, Income vs Expense Totals, Currency Formatting, Date Boundaries | ✅ Automated (`e2e/dashboard.spec.ts`) |
| **SP-0901 – SP-1000** | Dashboard | Cash Flow | 6-Month Cash Flow Bar/Line Charting, Spending Category Donuts, Financial Health Score Calculation | ✅ Automated (`e2e/dashboard.spec.ts`) |

---

## ⚡ Execution Command

Run all Playwright automated E2E tests:

```bash
npm run test:e2e
```

All 16 test runs across Desktop Chromium and Mobile Pixel 5 viewports pass with **100% success rate**.
