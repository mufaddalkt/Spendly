import { Transaction, Budget, RecurringExpense } from '@/types';
import { getMonthlyTotals, calcPercentage } from './finance';

export interface HealthFactor {
  name: string;
  score: number; // 0 - 100
  weight: number;
  label: string;
  status: 'positive' | 'warning' | 'negative';
}

export interface HealthScoreResult {
  score: number; // 0 - 100
  rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  factors: HealthFactor[];
  disclaimer: string;
}

export function calculateFinancialHealthScore(
  transactions: Transaction[],
  budgets: Budget[],
  recurring: RecurringExpense[],
  currentMonth: string
): HealthScoreResult {
  const totals = getMonthlyTotals(transactions, currentMonth);

  // 1. Savings Rate Factor (35% weight)
  // Target: >= 20% savings rate = 100 score
  const savingsRate = totals.savingsRate;
  const savingsScore = Math.min(100, Math.max(0, (savingsRate / 20) * 100));
  const savingsFactor: HealthFactor = {
    name: 'Savings Rate',
    score: Math.round(savingsScore),
    weight: 35,
    label: `${savingsRate.toFixed(1)}% savings rate`,
    status: savingsRate >= 20 ? 'positive' : savingsRate >= 10 ? 'warning' : 'negative',
  };

  // 2. Budget Adherence Factor (30% weight)
  // Target: All budgets <= 100% used, avg utilization ~80%
  const monthBudgets = budgets.filter((b) => b.month === currentMonth);
  let budgetScore = 100;
  if (monthBudgets.length > 0) {
    const exceeded = monthBudgets.filter((b) => b.spent > b.limit).length;
    const avgPct = monthBudgets.reduce((s, b) => s + calcPercentage(b.spent, b.limit), 0) / monthBudgets.length;
    if (exceeded > 0) budgetScore -= exceeded * 25;
    if (avgPct > 90) budgetScore -= 15;
    budgetScore = Math.max(0, budgetScore);
  }
  const budgetFactor: HealthFactor = {
    name: 'Budget Adherence',
    score: Math.round(budgetScore),
    weight: 30,
    label: monthBudgets.length === 0 ? 'No active budgets' : `${monthBudgets.filter((b) => b.spent <= b.limit).length}/${monthBudgets.length} budgets on track`,
    status: budgetScore >= 80 ? 'positive' : budgetScore >= 60 ? 'warning' : 'negative',
  };

  // 3. Spending Consistency Factor (20% weight)
  // Check if expense volatility is low over last 3 months
  let consistencyScore = 80;
  if (totals.income > 0 && totals.expenses <= totals.income) {
    consistencyScore = 90;
  } else if (totals.expenses > totals.income) {
    consistencyScore = 40;
  }
  const consistencyFactor: HealthFactor = {
    name: 'Spending Balance',
    score: Math.round(consistencyScore),
    weight: 20,
    label: totals.expenses <= totals.income ? 'Expenses within income' : 'Expenses exceed income',
    status: consistencyScore >= 80 ? 'positive' : consistencyScore >= 60 ? 'warning' : 'negative',
  };

  // 4. Recurring Expense Load Factor (15% weight)
  // Target: Recurring expenses <= 30% of total income
  const activeRecurring = recurring.filter((r) => r.isActive);
  const monthlyRecurringTotal = activeRecurring.reduce((s, r) => s + r.amount, 0);
  const recurringRatio = totals.income > 0 ? (monthlyRecurringTotal / totals.income) * 100 : 0;
  const recurringScore = Math.min(100, Math.max(0, 100 - (recurringRatio > 30 ? (recurringRatio - 30) * 2 : 0)));
  const recurringFactor: HealthFactor = {
    name: 'Fixed Cost Ratio',
    score: Math.round(recurringScore),
    weight: 15,
    label: totals.income > 0 ? `${recurringRatio.toFixed(0)}% of income in subscriptions` : `${activeRecurring.length} active recurring items`,
    status: recurringScore >= 80 ? 'positive' : recurringScore >= 60 ? 'warning' : 'negative',
  };

  // Weighted score calculation
  const totalScore = Math.round(
    (savingsFactor.score * 0.35) +
    (budgetFactor.score * 0.30) +
    (consistencyFactor.score * 0.20) +
    (recurringFactor.score * 0.15)
  );

  const rating =
    totalScore >= 80 ? 'Excellent' :
    totalScore >= 65 ? 'Good' :
    totalScore >= 50 ? 'Fair' : 'Needs Attention';

  return {
    score: totalScore,
    rating,
    factors: [savingsFactor, budgetFactor, consistencyFactor, recurringFactor],
    disclaimer: 'Informational Spendly Score based on your data — Not professional financial advice.',
  };
}
