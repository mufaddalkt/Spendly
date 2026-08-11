import { format, parseISO, isValid } from 'date-fns';
import { Currency, DateFormat, Transaction, Category, MonthlySummary, CategorySpending } from '@/types';

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function formatAmount(amount: number, currency: Currency = 'USD', showSign = false): string {
  const formatted = formatCurrency(Math.abs(amount), currency);
  if (showSign) return `${amount >= 0 ? '+' : '-'}${formatted}`;
  return formatted;
}

export function formatCompact(amount: number, currency: Currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return formatCurrency(amount, currency);
  }
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatDate(dateStr: string, dateFormat: DateFormat = 'MM/DD/YYYY'): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    switch (dateFormat) {
      case 'MM/DD/YYYY': return format(date, 'MM/dd/yyyy');
      case 'DD/MM/YYYY': return format(date, 'dd/MM/yyyy');
      case 'YYYY-MM-DD': return format(date, 'yyyy-MM-dd');
      default: return format(date, 'MM/dd/yyyy');
    }
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
}

export function formatDateLong(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatMonth(monthStr: string): string {
  try {
    return format(parseISO(`${monthStr}-01`), 'MMMM yyyy');
  } catch {
    return monthStr;
  }
}

// ─── Percentage ───────────────────────────────────────────────────────────────

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function calcPercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, (part / total) * 100);
}

export function calcChange(current: number, previous: number): { amount: number; percentage: number; direction: 'up' | 'down' | 'flat' } {
  const amount = current - previous;
  const percentage = previous === 0 ? 0 : Math.abs((amount / previous) * 100);
  const direction = amount > 0 ? 'up' : amount < 0 ? 'down' : 'flat';
  return { amount, percentage, direction };
}

// ─── Financial Calculations ───────────────────────────────────────────────────

export function getMonthlyTotals(
  transactions: Transaction[],
  month: string // 'YYYY-MM'
): { income: number; expenses: number; savings: number; savingsRate: number } {
  const monthTxns = transactions.filter((t) => t.date.startsWith(month));
  const income = monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  return { income, expenses, savings, savingsRate };
}

export function getMonthlySummaries(transactions: Transaction[], months = 6): MonthlySummary[] {
  const result: MonthlySummary[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = format(date, 'yyyy-MM');
    const totals = getMonthlyTotals(transactions, month);
    result.push({ month, ...totals });
  }
  return result;
}

export function getCategorySpending(
  transactions: Transaction[],
  categories: Category[],
  month?: string
): CategorySpending[] {
  const filtered = month ? transactions.filter((t) => t.date.startsWith(month)) : transactions;
  const expenseTxns = filtered.filter((t) => t.type === 'expense');
  const total = expenseTxns.reduce((s, t) => s + t.amount, 0);

  const grouped: Record<string, { amount: number; count: number }> = {};
  expenseTxns.forEach((t) => {
    if (!grouped[t.categoryId]) grouped[t.categoryId] = { amount: 0, count: 0 };
    grouped[t.categoryId].amount += t.amount;
    grouped[t.categoryId].count += 1;
  });

  return Object.entries(grouped)
    .map(([categoryId, { amount, count }]) => {
      const category = categories.find((c) => c.id === categoryId) || {
        id: categoryId, name: 'Unknown', color: '#6b7280', icon: 'MoreHorizontal',
      };
      return {
        categoryId,
        categoryName: category.name,
        color: (category as Category).color,
        icon: (category as Category).icon,
        amount,
        count,
        percentage: calcPercentage(amount, total),
      } as CategorySpending;
    })
    .sort((a, b) => b.amount - a.amount);
}

export function getDailyTotals(transactions: Transaction[], year: number, month: number) {
  const result: Record<string, { income: number; expenses: number; net: number }> = {};
  transactions
    .filter((t) => {
      const d = parseISO(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .forEach((t) => {
      if (!result[t.date]) result[t.date] = { income: 0, expenses: 0, net: 0 };
      if (t.type === 'income') result[t.date].income += t.amount;
      else result[t.date].expenses += t.amount;
      result[t.date].net = result[t.date].income - result[t.date].expenses;
    });
  return result;
}

export function generateInsights(
  transactions: Transaction[],
  categories: Category[],
  budgets: { categoryId: string; limit: number; spent: number; month: string }[]
): string[] {
  const insights: string[] = [];
  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  const lastMonth = format(new Date(now.getFullYear(), now.getMonth() - 1, 1), 'yyyy-MM');

  const current = getMonthlyTotals(transactions, currentMonth);
  const previous = getMonthlyTotals(transactions, lastMonth);

  if (current.expenses > previous.expenses && previous.expenses > 0) {
    const pct = ((current.expenses - previous.expenses) / previous.expenses * 100).toFixed(0);
    insights.push(`Your spending increased by ${pct}% compared to last month.`);
  } else if (current.expenses < previous.expenses && previous.expenses > 0) {
    const pct = ((previous.expenses - current.expenses) / previous.expenses * 100).toFixed(0);
    insights.push(`Great job! You spent ${pct}% less than last month.`);
  }

  const catSpending = getCategorySpending(transactions, categories, currentMonth);
  if (catSpending.length > 0) {
    insights.push(`${catSpending[0].categoryName} is your highest spending category this month at $${catSpending[0].amount.toFixed(0)}.`);
  }

  if (current.savingsRate > 20) {
    insights.push(`Excellent savings rate of ${current.savingsRate.toFixed(0)}% this month!`);
  } else if (current.savingsRate > 0 && current.savingsRate <= 10) {
    insights.push(`Your savings rate is ${current.savingsRate.toFixed(0)}%. Consider reducing discretionary spending.`);
  }

  const currentBudgets = budgets.filter((b) => b.month === currentMonth);
  const warningBudgets = currentBudgets.filter((b) => b.limit > 0 && b.spent / b.limit >= 0.8 && b.spent < b.limit);
  warningBudgets.forEach((b) => {
    const cat = categories.find((c) => c.id === b.categoryId);
    if (cat) {
      const pct = ((b.spent / b.limit) * 100).toFixed(0);
      insights.push(`You're at ${pct}% of your ${cat.name} budget — watch your spending.`);
    }
  });

  const exceededBudgets = currentBudgets.filter((b) => b.limit > 0 && b.spent > b.limit);
  exceededBudgets.forEach((b) => {
    const cat = categories.find((c) => c.id === b.categoryId);
    if (cat) insights.push(`You've exceeded your ${cat.name} budget by $${(b.spent - b.limit).toFixed(2)}.`);
  });

  if (previous.savingsRate > 0 && current.savingsRate > previous.savingsRate) {
    insights.push(`Your savings rate improved from ${previous.savingsRate.toFixed(0)}% to ${current.savingsRate.toFixed(0)}% — great progress!`);
  }

  return insights.slice(0, 5);
}

// ─── Payment Method Labels ────────────────────────────────────────────────────
export const paymentMethodLabels: Record<string, string> = {
  cash: 'Cash',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  bank_transfer: 'Bank Transfer',
  paypal: 'PayPal',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  other: 'Other',
};

export const frequencyLabels: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export function getMonthlyEquivalent(amount: number, frequency: string): number {
  switch (frequency) {
    case 'weekly': return amount * 52 / 12;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'yearly': return amount / 12;
    default: return amount;
  }
}

export function daysUntil(dateStr: string): number {
  const target = parseISO(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// CSV Export
export function exportTransactionsCSV(transactions: Transaction[], categories: Category[]): void {
  const catMap: Record<string, string> = {};
  categories.forEach((c) => { catMap[c.id] = c.name; });

  const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Payment Method', 'Account', 'Notes'];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`,
    t.type,
    catMap[t.categoryId] || 'Unknown',
    t.type === 'expense' ? `-${t.amount}` : `${t.amount}`,
    t.paymentMethod,
    t.account,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spendly-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
