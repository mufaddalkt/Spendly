import { Transaction, Category, Budget, SavingsGoal, RecurringExpense } from '@/types';

export interface ExpectedFinancials {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

/**
 * Independent financial calculator engine.
 * Computes exact financial results independently of Spendly UI.
 */
export function computeExpectedFinancials(
  transactions: Array<{ amount: number; type: 'income' | 'expense'; date: string }>,
  targetMonth?: string
): ExpectedFinancials {
  const filtered = targetMonth
    ? transactions.filter((t) => t.date.startsWith(targetMonth))
    : transactions;

  const income = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const allTimeIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const allTimeExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = allTimeIncome - allTimeExpenses;
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  return {
    balance: Math.round(balance * 100) / 100,
    income: Math.round(income * 100) / 100,
    expenses: Math.round(expenses * 100) / 100,
    savings: Math.round(savings * 100) / 100,
    savingsRate: Math.round(savingsRate * 10) / 10,
  };
}

/**
 * Helper to format currency for exact text matching in test assertions.
 */
export function formatExpectedCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isNegative ? `-${formatted}` : formatted;
}
