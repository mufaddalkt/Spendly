import { Category, Transaction, Budget, SavingsGoal, RecurringExpense } from '@/types';
import { addMonths, subMonths, format, subDays, addDays } from 'date-fns';

const now = new Date();
const today = format(now, 'yyyy-MM-dd');

// ─── Default Categories ───────────────────────────────────────────────────────

export const defaultCategories: Category[] = [
  // Expense categories
  { id: 'cat-food', name: 'Food & Dining', type: 'expense', icon: 'UtensilsCrossed', color: '#f97316', isCustom: false, createdAt: today },
  { id: 'cat-shopping', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#8b5cf6', isCustom: false, createdAt: today },
  { id: 'cat-transport', name: 'Transport', type: 'expense', icon: 'Car', color: '#3b82f6', isCustom: false, createdAt: today },
  { id: 'cat-bills', name: 'Bills & Utilities', type: 'expense', icon: 'Receipt', color: '#ef4444', isCustom: false, createdAt: today },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', icon: 'Tv', color: '#ec4899', isCustom: false, createdAt: today },
  { id: 'cat-health', name: 'Health & Fitness', type: 'expense', icon: 'Heart', color: '#10b981', isCustom: false, createdAt: today },
  { id: 'cat-education', name: 'Education', type: 'expense', icon: 'BookOpen', color: '#06b6d4', isCustom: false, createdAt: today },
  { id: 'cat-travel', name: 'Travel', type: 'expense', icon: 'Plane', color: '#f59e0b', isCustom: false, createdAt: today },
  { id: 'cat-subscriptions', name: 'Subscriptions', type: 'expense', icon: 'RefreshCw', color: '#6366f1', isCustom: false, createdAt: today },
  { id: 'cat-other-exp', name: 'Other', type: 'expense', icon: 'MoreHorizontal', color: '#6b7280', isCustom: false, createdAt: today },
  // Income categories
  { id: 'cat-salary', name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10b981', isCustom: false, createdAt: today },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#3b82f6', isCustom: false, createdAt: today },
  { id: 'cat-business', name: 'Business', type: 'income', icon: 'Building2', color: '#8b5cf6', isCustom: false, createdAt: today },
  { id: 'cat-investment', name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#f59e0b', isCustom: false, createdAt: today },
  { id: 'cat-gift', name: 'Gift', type: 'income', icon: 'Gift', color: '#ec4899', isCustom: false, createdAt: today },
  { id: 'cat-other-inc', name: 'Other Income', type: 'income', icon: 'PlusCircle', color: '#6b7280', isCustom: false, createdAt: today },
];

// ─── Helper to generate realistic transactions ─────────────────────────────────

function makeDate(daysAgo: number) {
  return format(subDays(now, daysAgo), 'yyyy-MM-dd');
}

function makeId(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(4, '0')}`;
}

// ─── Seed Transactions (60+) ──────────────────────────────────────────────────

export const seedTransactions: Transaction[] = [
  // === CURRENT MONTH ===
  { id: makeId('txn', 1), description: 'Monthly Salary', amount: 5800, type: 'income', categoryId: 'cat-salary', date: format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd'), paymentMethod: 'bank_transfer', account: 'Checking', notes: 'Net salary after taxes', isRecurring: true, recurringId: 'rec-salary', createdAt: today, updatedAt: today },
  { id: makeId('txn', 2), description: 'Whole Foods Market', amount: 127.45, type: 'expense', categoryId: 'cat-food', date: makeDate(1), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 3), description: 'Netflix', amount: 15.99, type: 'expense', categoryId: 'cat-subscriptions', date: makeDate(2), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-netflix', createdAt: today, updatedAt: today },
  { id: makeId('txn', 4), description: 'Uber Eats', amount: 34.80, type: 'expense', categoryId: 'cat-food', date: makeDate(2), paymentMethod: 'credit_card', account: 'Checking', notes: 'Dinner delivery', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 5), description: 'Shell Gas Station', amount: 62.10, type: 'expense', categoryId: 'cat-transport', date: makeDate(3), paymentMethod: 'debit_card', account: 'Checking', notes: '', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 6), description: 'Amazon.com', amount: 89.99, type: 'expense', categoryId: 'cat-shopping', date: makeDate(3), paymentMethod: 'credit_card', account: 'Checking', notes: 'Wireless headphones', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 7), description: 'Electricity Bill', amount: 98.50, type: 'expense', categoryId: 'cat-bills', date: makeDate(4), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-electricity', createdAt: today, updatedAt: today },
  { id: makeId('txn', 8), description: 'Freelance Project - Web Design', amount: 1200, type: 'income', categoryId: 'cat-freelance', date: makeDate(4), paymentMethod: 'bank_transfer', account: 'Checking', notes: 'TechCorp landing page redesign', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 9), description: 'Starbucks', amount: 6.75, type: 'expense', categoryId: 'cat-food', date: makeDate(5), paymentMethod: 'apple_pay', account: 'Checking', notes: '', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 10), description: 'Gym Membership', amount: 49.99, type: 'expense', categoryId: 'cat-health', date: makeDate(5), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-gym', createdAt: today, updatedAt: today },
  { id: makeId('txn', 11), description: 'Spotify Premium', amount: 9.99, type: 'expense', categoryId: 'cat-subscriptions', date: makeDate(6), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-spotify', createdAt: today, updatedAt: today },
  { id: makeId('txn', 12), description: 'Target', amount: 145.30, type: 'expense', categoryId: 'cat-shopping', date: makeDate(6), paymentMethod: 'debit_card', account: 'Checking', notes: 'Household supplies', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 13), description: 'Subway Commuter Pass', amount: 127.00, type: 'expense', categoryId: 'cat-transport', date: makeDate(7), paymentMethod: 'credit_card', account: 'Checking', notes: 'Monthly transit pass', isRecurring: true, recurringId: 'rec-transit', createdAt: today, updatedAt: today },
  { id: makeId('txn', 14), description: 'Internet Bill', amount: 79.99, type: 'expense', categoryId: 'cat-bills', date: makeDate(8), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-internet', createdAt: today, updatedAt: today },
  { id: makeId('txn', 15), description: 'Chipotle Mexican Grill', amount: 18.50, type: 'expense', categoryId: 'cat-food', date: makeDate(9), paymentMethod: 'apple_pay', account: 'Checking', notes: '', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 16), description: 'Apple iCloud Storage', amount: 2.99, type: 'expense', categoryId: 'cat-subscriptions', date: makeDate(10), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-icloud', createdAt: today, updatedAt: today },
  { id: makeId('txn', 17), description: 'Movie Theater', amount: 28.00, type: 'expense', categoryId: 'cat-entertainment', date: makeDate(10), paymentMethod: 'credit_card', account: 'Checking', notes: 'Two tickets', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 18), description: 'Pharmacy - CVS', amount: 42.15, type: 'expense', categoryId: 'cat-health', date: makeDate(11), paymentMethod: 'debit_card', account: 'Checking', notes: 'Prescriptions', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 19), description: 'Dividend Income', amount: 245.00, type: 'income', categoryId: 'cat-investment', date: makeDate(12), paymentMethod: 'bank_transfer', account: 'Investment', notes: 'Quarterly dividend payout', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 20), description: 'Restaurant - The Capital Grille', amount: 175.40, type: 'expense', categoryId: 'cat-food', date: makeDate(13), paymentMethod: 'credit_card', account: 'Checking', notes: 'Anniversary dinner', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 21), description: 'Parking Fees', amount: 25.00, type: 'expense', categoryId: 'cat-transport', date: makeDate(14), paymentMethod: 'cash', account: 'Cash', notes: '', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 22), description: 'Online Course - Udemy', amount: 19.99, type: 'expense', categoryId: 'cat-education', date: makeDate(15), paymentMethod: 'credit_card', account: 'Checking', notes: 'React course', isRecurring: false, createdAt: today, updatedAt: today },

  // === LAST MONTH ===
  { id: makeId('txn', 23), description: 'Monthly Salary', amount: 5800, type: 'income', categoryId: 'cat-salary', date: format(new Date(now.getFullYear(), now.getMonth() - 1, 1), 'yyyy-MM-dd'), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-salary', createdAt: today, updatedAt: today },
  { id: makeId('txn', 24), description: 'Whole Foods Market', amount: 112.80, type: 'expense', categoryId: 'cat-food', date: makeDate(32), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 25), description: 'Netflix', amount: 15.99, type: 'expense', categoryId: 'cat-subscriptions', date: makeDate(33), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-netflix', createdAt: today, updatedAt: today },
  { id: makeId('txn', 26), description: 'Freelance Project - Logo Design', amount: 600, type: 'income', categoryId: 'cat-freelance', date: makeDate(34), paymentMethod: 'paypal', account: 'PayPal', notes: 'StartupX branding', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 27), description: 'Shell Gas Station', amount: 58.30, type: 'expense', categoryId: 'cat-transport', date: makeDate(35), paymentMethod: 'debit_card', account: 'Checking', notes: '', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 28), description: 'Amazon.com', amount: 234.67, type: 'expense', categoryId: 'cat-shopping', date: makeDate(36), paymentMethod: 'credit_card', account: 'Checking', notes: 'Office supplies and books', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 29), description: 'Electricity Bill', amount: 105.20, type: 'expense', categoryId: 'cat-bills', date: makeDate(37), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-electricity', createdAt: today, updatedAt: today },
  { id: makeId('txn', 30), description: 'Gym Membership', amount: 49.99, type: 'expense', categoryId: 'cat-health', date: makeDate(38), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-gym', createdAt: today, updatedAt: today },
  { id: makeId('txn', 31), description: 'Spotify Premium', amount: 9.99, type: 'expense', categoryId: 'cat-subscriptions', date: makeDate(39), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-spotify', createdAt: today, updatedAt: today },
  { id: makeId('txn', 32), description: 'Subway Commuter Pass', amount: 127.00, type: 'expense', categoryId: 'cat-transport', date: makeDate(40), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-transit', createdAt: today, updatedAt: today },
  { id: makeId('txn', 33), description: 'Internet Bill', amount: 79.99, type: 'expense', categoryId: 'cat-bills', date: makeDate(41), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-internet', createdAt: today, updatedAt: today },
  { id: makeId('txn', 34), description: 'Concert Tickets', amount: 120.00, type: 'expense', categoryId: 'cat-entertainment', date: makeDate(42), paymentMethod: 'credit_card', account: 'Checking', notes: 'Jazz Festival', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 35), description: 'Doctor Visit Copay', amount: 30.00, type: 'expense', categoryId: 'cat-health', date: makeDate(43), paymentMethod: 'debit_card', account: 'Checking', notes: 'Annual checkup', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 36), description: 'Home Depot', amount: 89.45, type: 'expense', categoryId: 'cat-shopping', date: makeDate(44), paymentMethod: 'credit_card', account: 'Checking', notes: 'Garden supplies', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 37), description: 'Starbucks', amount: 42.25, type: 'expense', categoryId: 'cat-food', date: makeDate(45), paymentMethod: 'apple_pay', account: 'Checking', notes: 'Weekly coffee', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 38), description: 'Apple iCloud Storage', amount: 2.99, type: 'expense', categoryId: 'cat-subscriptions', date: makeDate(46), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-icloud', createdAt: today, updatedAt: today },

  // === 2 MONTHS AGO ===
  { id: makeId('txn', 39), description: 'Monthly Salary', amount: 5800, type: 'income', categoryId: 'cat-salary', date: format(new Date(now.getFullYear(), now.getMonth() - 2, 1), 'yyyy-MM-dd'), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-salary', createdAt: today, updatedAt: today },
  { id: makeId('txn', 40), description: 'Freelance Project - App Development', amount: 2500, type: 'income', categoryId: 'cat-freelance', date: makeDate(65), paymentMethod: 'bank_transfer', account: 'Checking', notes: 'Mobile app MVP', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 41), description: 'Weekend Trip to NYC', amount: 450.00, type: 'expense', categoryId: 'cat-travel', date: makeDate(62), paymentMethod: 'credit_card', account: 'Checking', notes: 'Hotel + activities', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 42), description: 'Electricity Bill', amount: 92.40, type: 'expense', categoryId: 'cat-bills', date: makeDate(67), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-electricity', createdAt: today, updatedAt: today },
  { id: makeId('txn', 43), description: 'Costco', amount: 312.55, type: 'expense', categoryId: 'cat-shopping', date: makeDate(63), paymentMethod: 'debit_card', account: 'Checking', notes: 'Bulk groceries and household items', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 44), description: 'Gym Membership', amount: 49.99, type: 'expense', categoryId: 'cat-health', date: makeDate(68), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-gym', createdAt: today, updatedAt: today },
  { id: makeId('txn', 45), description: 'Netflix', amount: 15.99, type: 'expense', categoryId: 'cat-subscriptions', date: makeDate(63), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-netflix', createdAt: today, updatedAt: today },
  { id: makeId('txn', 46), description: 'Restaurants (various)', amount: 280.40, type: 'expense', categoryId: 'cat-food', date: makeDate(64), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 47), description: 'Uber Rides', amount: 78.60, type: 'expense', categoryId: 'cat-transport', date: makeDate(65), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: false, createdAt: today, updatedAt: today },

  // === 3 MONTHS AGO ===
  { id: makeId('txn', 48), description: 'Monthly Salary', amount: 5800, type: 'income', categoryId: 'cat-salary', date: format(new Date(now.getFullYear(), now.getMonth() - 3, 1), 'yyyy-MM-dd'), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-salary', createdAt: today, updatedAt: today },
  { id: makeId('txn', 49), description: 'Flight to Miami', amount: 280.00, type: 'expense', categoryId: 'cat-travel', date: makeDate(92), paymentMethod: 'credit_card', account: 'Checking', notes: 'Round trip', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 50), description: 'Hotel in Miami', amount: 340.00, type: 'expense', categoryId: 'cat-travel', date: makeDate(91), paymentMethod: 'credit_card', account: 'Checking', notes: '3 nights', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 51), description: 'Electricity Bill', amount: 88.70, type: 'expense', categoryId: 'cat-bills', date: makeDate(97), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-electricity', createdAt: today, updatedAt: today },
  { id: makeId('txn', 52), description: 'Online Course Bundle', amount: 49.99, type: 'expense', categoryId: 'cat-education', date: makeDate(95), paymentMethod: 'credit_card', account: 'Checking', notes: 'Full-stack development', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 53), description: 'Freelance Consulting', amount: 800, type: 'income', categoryId: 'cat-freelance', date: makeDate(93), paymentMethod: 'paypal', account: 'PayPal', notes: '4 hours consulting', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 54), description: 'Grocery Shopping', amount: 198.40, type: 'expense', categoryId: 'cat-food', date: makeDate(94), paymentMethod: 'debit_card', account: 'Checking', notes: '', isRecurring: false, createdAt: today, updatedAt: today },

  // === 4-5 MONTHS AGO ===
  { id: makeId('txn', 55), description: 'Monthly Salary', amount: 5500, type: 'income', categoryId: 'cat-salary', date: format(new Date(now.getFullYear(), now.getMonth() - 4, 1), 'yyyy-MM-dd'), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-salary', createdAt: today, updatedAt: today },
  { id: makeId('txn', 56), description: 'Monthly Salary', amount: 5500, type: 'income', categoryId: 'cat-salary', date: format(new Date(now.getFullYear(), now.getMonth() - 5, 1), 'yyyy-MM-dd'), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-salary', createdAt: today, updatedAt: today },
  { id: makeId('txn', 57), description: 'Stock Dividend', amount: 380.00, type: 'income', categoryId: 'cat-investment', date: makeDate(120), paymentMethod: 'bank_transfer', account: 'Investment', notes: '', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 58), description: 'New Laptop', amount: 1299.00, type: 'expense', categoryId: 'cat-shopping', date: makeDate(125), paymentMethod: 'credit_card', account: 'Checking', notes: 'MacBook Air M2', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 59), description: 'Birthday Gift from Parents', amount: 200, type: 'income', categoryId: 'cat-gift', date: makeDate(130), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 60), description: 'Annual Physical Therapy', amount: 150.00, type: 'expense', categoryId: 'cat-health', date: makeDate(140), paymentMethod: 'debit_card', account: 'Checking', notes: '5 sessions', isRecurring: false, createdAt: today, updatedAt: today },
  { id: makeId('txn', 61), description: 'Electricity Bill', amount: 82.10, type: 'expense', categoryId: 'cat-bills', date: makeDate(127), paymentMethod: 'bank_transfer', account: 'Checking', notes: '', isRecurring: true, recurringId: 'rec-electricity', createdAt: today, updatedAt: today },
  { id: makeId('txn', 62), description: 'Restaurants & Takeout', amount: 245.80, type: 'expense', categoryId: 'cat-food', date: makeDate(128), paymentMethod: 'credit_card', account: 'Checking', notes: '', isRecurring: false, createdAt: today, updatedAt: today },
];

// ─── Seed Budgets ─────────────────────────────────────────────────────────────

const currentMonth = format(now, 'yyyy-MM');
const lastMonth = format(subMonths(now, 1), 'yyyy-MM');

export const seedBudgets: Budget[] = [
  { id: 'budget-001', categoryId: 'cat-food', limit: 600, month: currentMonth, spent: 387.50, createdAt: today, updatedAt: today },
  { id: 'budget-002', categoryId: 'cat-shopping', limit: 400, month: currentMonth, spent: 235.29, createdAt: today, updatedAt: today },
  { id: 'budget-003', categoryId: 'cat-transport', limit: 250, month: currentMonth, spent: 214.10, createdAt: today, updatedAt: today },
  { id: 'budget-004', categoryId: 'cat-entertainment', limit: 150, month: currentMonth, spent: 28.00, createdAt: today, updatedAt: today },
  { id: 'budget-005', categoryId: 'cat-health', limit: 200, month: currentMonth, spent: 92.14, createdAt: today, updatedAt: today },
  { id: 'budget-006', categoryId: 'cat-subscriptions', limit: 50, month: currentMonth, spent: 28.97, createdAt: today, updatedAt: today },
  { id: 'budget-007', categoryId: 'cat-bills', limit: 300, month: currentMonth, spent: 178.49, createdAt: today, updatedAt: today },
  { id: 'budget-008', categoryId: 'cat-food', limit: 600, month: lastMonth, spent: 431.05, createdAt: today, updatedAt: today },
  { id: 'budget-009', categoryId: 'cat-shopping', limit: 400, month: lastMonth, spent: 324.12, createdAt: today, updatedAt: today },
  { id: 'budget-010', categoryId: 'cat-entertainment', limit: 150, month: lastMonth, spent: 162.00, createdAt: today, updatedAt: today },
];

// ─── Seed Savings Goals ───────────────────────────────────────────────────────

export const seedGoals: SavingsGoal[] = [
  {
    id: 'goal-001',
    name: 'Emergency Fund',
    targetAmount: 15000,
    currentAmount: 8500,
    targetDate: format(addMonths(now, 8), 'yyyy-MM-dd'),
    description: '6 months of living expenses as safety net',
    color: '#10b981',
    icon: 'Shield',
    isCompleted: false,
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 'goal-002',
    name: 'Vacation to Japan',
    targetAmount: 5000,
    currentAmount: 2200,
    targetDate: format(addMonths(now, 5), 'yyyy-MM-dd'),
    description: '2-week trip to Tokyo and Kyoto',
    color: '#f97316',
    icon: 'Plane',
    isCompleted: false,
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 'goal-003',
    name: 'New Car Down Payment',
    targetAmount: 8000,
    currentAmount: 3200,
    targetDate: format(addMonths(now, 12), 'yyyy-MM-dd'),
    description: '20% down payment for a new vehicle',
    color: '#3b82f6',
    icon: 'Car',
    isCompleted: false,
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 'goal-004',
    name: 'MacBook Pro',
    targetAmount: 2500,
    currentAmount: 2500,
    targetDate: format(subMonths(now, 1), 'yyyy-MM-dd'),
    description: 'Upgrade for work',
    color: '#8b5cf6',
    icon: 'Laptop',
    isCompleted: true,
    createdAt: today,
    updatedAt: today,
  },
];

// ─── Seed Recurring Expenses ──────────────────────────────────────────────────

export const seedRecurring: RecurringExpense[] = [
  {
    id: 'rec-salary',
    name: 'Monthly Salary',
    amount: 5800,
    categoryId: 'cat-salary',
    frequency: 'monthly',
    startDate: format(subMonths(now, 6), 'yyyy-MM-dd'),
    nextPayment: format(new Date(now.getFullYear(), now.getMonth() + 1, 1), 'yyyy-MM-dd'),
    paymentMethod: 'bank_transfer',
    isActive: true,
    notes: 'Regular monthly salary',
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 'rec-netflix',
    name: 'Netflix',
    amount: 15.99,
    categoryId: 'cat-subscriptions',
    frequency: 'monthly',
    startDate: format(subMonths(now, 12), 'yyyy-MM-dd'),
    nextPayment: format(addDays(now, 3), 'yyyy-MM-dd'),
    paymentMethod: 'credit_card',
    isActive: true,
    notes: 'Standard plan',
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 'rec-spotify',
    name: 'Spotify Premium',
    amount: 9.99,
    categoryId: 'cat-subscriptions',
    frequency: 'monthly',
    startDate: format(subMonths(now, 18), 'yyyy-MM-dd'),
    nextPayment: format(addDays(now, 7), 'yyyy-MM-dd'),
    paymentMethod: 'credit_card',
    isActive: true,
    notes: 'Individual plan',
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 'rec-gym',
    name: 'Planet Fitness Gym',
    amount: 49.99,
    categoryId: 'cat-health',
    frequency: 'monthly',
    startDate: format(subMonths(now, 8), 'yyyy-MM-dd'),
    nextPayment: format(addDays(now, 12), 'yyyy-MM-dd'),
    paymentMethod: 'credit_card',
    isActive: true,
    notes: 'Black card membership',
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 'rec-electricity',
    name: 'Electricity Bill',
    amount: 95.00,
    categoryId: 'cat-bills',
    frequency: 'monthly',
    startDate: format(subMonths(now, 24), 'yyyy-MM-dd'),
    nextPayment: format(addDays(now, 18), 'yyyy-MM-dd'),
    paymentMethod: 'bank_transfer',
    isActive: true,
    notes: 'Estimated average',
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 'rec-internet',
    name: 'Internet Service',
    amount: 79.99,
    categoryId: 'cat-bills',
    frequency: 'monthly',
    startDate: format(subMonths(now, 36), 'yyyy-MM-dd'),
    nextPayment: format(addDays(now, 22), 'yyyy-MM-dd'),
    paymentMethod: 'bank_transfer',
    isActive: true,
    notes: 'Fiber 500Mbps',
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 'rec-transit',
    name: 'Transit Monthly Pass',
    amount: 127.00,
    categoryId: 'cat-transport',
    frequency: 'monthly',
    startDate: format(subMonths(now, 4), 'yyyy-MM-dd'),
    nextPayment: format(new Date(now.getFullYear(), now.getMonth() + 1, 1), 'yyyy-MM-dd'),
    paymentMethod: 'credit_card',
    isActive: true,
    notes: 'City metro unlimited pass',
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 'rec-icloud',
    name: 'iCloud+ 50GB',
    amount: 2.99,
    categoryId: 'cat-subscriptions',
    frequency: 'monthly',
    startDate: format(subMonths(now, 14), 'yyyy-MM-dd'),
    nextPayment: format(addDays(now, 5), 'yyyy-MM-dd'),
    paymentMethod: 'credit_card',
    isActive: true,
    notes: '',
    createdAt: today,
    updatedAt: today,
  },
];
