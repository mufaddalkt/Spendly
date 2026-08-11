// ─── Core Entity Types ───────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay'
  | 'other';

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type ThemeMode = 'light' | 'dark' | 'system';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'INR';

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

export type WeekStart = 'sunday' | 'monday';

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'both';
  icon: string;
  color: string;
  isCustom: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // ISO date string
  paymentMethod: PaymentMethod;
  account: string;
  notes: string;
  isRecurring: boolean;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  month: string; // 'YYYY-MM'
  spent: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description: string;
  color: string;
  icon: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  frequency: RecurringFrequency;
  startDate: string;
  nextPayment: string;
  paymentMethod: PaymentMethod;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'upcoming_payment' | 'goal_milestone' | 'monthly_summary' | 'info';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface UserSettings {
  currency: Currency;
  dateFormat: DateFormat;
  weekStart: WeekStart;
  theme: ThemeMode;
  notifications: {
    budgetWarnings: boolean;
    upcomingPayments: boolean;
    monthlySummaries: boolean;
  };
}

// ─── Computed / Derived Types ─────────────────────────────────────────────────

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface BudgetWithCategory extends Budget {
  category: Category;
  percentage: number;
  remaining: number;
  status: 'healthy' | 'warning' | 'exceeded';
}

export interface TransactionWithCategory extends Transaction {
  category: Category;
}

export interface RecurringWithCategory extends RecurringExpense {
  category: Category;
  monthlyEquivalent: number;
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  userAccounts: UserAccount[];
  activeUserId: string | null;
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  recurringExpenses: RecurringExpense[];
  categories: Category[];
  notifications: Notification[];
  profile: UserProfile;
  settings: UserSettings;
  isHydrated: boolean;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface TransactionFormData {
  description: string;
  amount: string;
  type: TransactionType;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  account: string;
  notes: string;
}

export interface BudgetFormData {
  categoryId: string;
  limit: string;
  month: string;
}

export interface GoalFormData {
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  description: string;
  color: string;
  icon: string;
}

export interface RecurringFormData {
  name: string;
  amount: string;
  categoryId: string;
  frequency: RecurringFrequency;
  startDate: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface TransactionFilters {
  search: string;
  type: 'all' | TransactionType;
  categoryId: string;
  paymentMethod: 'all' | PaymentMethod;
  dateFrom: string;
  dateTo: string;
}

export type SortField = 'date' | 'amount' | 'description' | 'category';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
