import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AppState, Transaction, Budget, SavingsGoal, RecurringExpense,
  Category, Notification, UserProfile, UserSettings, UserAccount
} from '@/types';
import {
  defaultCategories, seedTransactions, seedBudgets, seedGoals, seedRecurring
} from '@/lib/data/seed';
import { format } from 'date-fns';
import { nanoid } from '@/lib/utils/nanoid';

const today = format(new Date(), 'yyyy-MM-dd');

const emptyProfile: UserProfile = {
  id: '',
  name: '',
  email: '',
  avatar: '',
};

const defaultSettings: UserSettings = {
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  weekStart: 'sunday',
  theme: 'system',
  notifications: {
    budgetWarnings: true,
    upcomingPayments: true,
    monthlySummaries: true,
  },
};

interface AppStore extends AppState {
  // Auth Actions
  signUp: (name: string, email: string, password: string) => { success: boolean; error?: string };
  signIn: (email: string, password: string) => { success: boolean; error?: string };
  signOut: () => void;

  // Transaction actions
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactions: (ids: string[]) => void;

  // Budget actions
  addBudget: (b: Omit<Budget, 'id' | 'spent' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  recalculateBudgetSpent: (categoryId: string, month: string) => void;

  // Goal actions
  addGoal: (g: Omit<SavingsGoal, 'id' | 'isCompleted' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, g: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addToGoal: (id: string, amount: number) => void;
  withdrawFromGoal: (id: string, amount: number) => void;

  // Recurring actions
  addRecurring: (r: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecurring: (id: string, r: Partial<RecurringExpense>) => void;
  deleteRecurring: (id: string) => void;
  toggleRecurring: (id: string) => void;

  // Category actions
  addCategory: (c: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Notification actions
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Settings actions
  updateProfile: (p: Partial<UserProfile>) => void;
  updateSettings: (s: Partial<UserSettings>) => void;

  // Data actions
  resetToDemo: () => void;
  clearAllUserData: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state — CLEAN SLATE FROM SCRATCH
      userAccounts: [],
      activeUserId: '',
      transactions: [],
      budgets: [],
      savingsGoals: [],
      recurringExpenses: [],
      categories: defaultCategories,
      notifications: [],
      profile: emptyProfile,
      settings: defaultSettings,
      isHydrated: true,

      // ── Auth Actions ─────────────────────────────────────────────────────────
      signUp: (name, email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        const existing = get().userAccounts.find((u) => u.email.toLowerCase() === cleanEmail);
        if (existing) {
          return { success: false, error: 'An account with this email already exists.' };
        }

        const newUser: UserAccount = {
          id: nanoid(),
          name: name.trim(),
          email: cleanEmail,
          password,
          createdAt: new Date().toISOString(),
        };

        const newProfile: UserProfile = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatar: '',
        };

        set((s) => ({
          userAccounts: [...s.userAccounts, newUser],
          activeUserId: newUser.id,
          profile: newProfile,
          // New user starts with clean slate!
          transactions: [],
          budgets: [],
          savingsGoals: [],
          recurringExpenses: [],
          categories: defaultCategories,
          notifications: [
            {
              id: nanoid(),
              type: 'info',
              title: `Welcome to Spendly, ${newUser.name}! 👋`,
              message: 'Your account is ready. Add your first transaction to get started!',
              isRead: false,
              createdAt: today,
            },
          ],
        }));

        return { success: true };
      },

      signIn: (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        const user = get().userAccounts.find((u) => u.email.toLowerCase() === cleanEmail);

        if (!user || user.password !== password) {
          return { success: false, error: 'Invalid email or password.' };
        }

        set({
          activeUserId: user.id,
          profile: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar || '',
          },
        });

        return { success: true };
      },

      signOut: () => {
        set({ activeUserId: null });
      },

      // ── Transaction Actions ──────────────────────────────────────────────────
      addTransaction: (t) => {
        const now = new Date().toISOString();
        const newTxn: Transaction = { ...t, id: nanoid(), createdAt: now, updatedAt: now };
        set((s) => ({ transactions: [newTxn, ...s.transactions] }));
        const month = t.date.slice(0, 7);
        if (t.type === 'expense') {
          get().recalculateBudgetSpent(t.categoryId, month);
        }
      },

      updateTransaction: (id, t) => {
        set((s) => ({
          transactions: s.transactions.map((txn) =>
            txn.id === id ? { ...txn, ...t, updatedAt: new Date().toISOString() } : txn
          ),
        }));
        const txn = get().transactions.find((x) => x.id === id);
        if (txn && txn.type === 'expense') {
          get().recalculateBudgetSpent(txn.categoryId, txn.date.slice(0, 7));
        }
      },

      deleteTransaction: (id) => {
        const txn = get().transactions.find((x) => x.id === id);
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
        if (txn && txn.type === 'expense') {
          get().recalculateBudgetSpent(txn.categoryId, txn.date.slice(0, 7));
        }
      },

      deleteTransactions: (ids) => {
        const toDelete = get().transactions.filter((t) => ids.includes(t.id));
        set((s) => ({ transactions: s.transactions.filter((t) => !ids.includes(t.id)) }));
        const affected = new Set(toDelete.filter((t) => t.type === 'expense').map((t) => `${t.categoryId}|${t.date.slice(0, 7)}`));
        affected.forEach((key) => {
          const [catId, month] = key.split('|');
          get().recalculateBudgetSpent(catId, month);
        });
      },

      // ── Budget Actions ───────────────────────────────────────────────────────
      addBudget: (b) => {
        const now = new Date().toISOString();
        const spent = get().transactions
          .filter((t) => t.categoryId === b.categoryId && t.date.startsWith(b.month) && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        set((s) => ({
          budgets: [...s.budgets, { ...b, id: nanoid(), spent, createdAt: now, updatedAt: now }],
        }));
      },

      updateBudget: (id, b) => {
        set((s) => ({
          budgets: s.budgets.map((budget) =>
            budget.id === id ? { ...budget, ...b, updatedAt: new Date().toISOString() } : budget
          ),
        }));
      },

      deleteBudget: (id) => {
        set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
      },

      recalculateBudgetSpent: (categoryId, month) => {
        const spent = get().transactions
          .filter((t) => t.categoryId === categoryId && t.date.startsWith(month) && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        set((s) => ({
          budgets: s.budgets.map((b) =>
            b.categoryId === categoryId && b.month === month
              ? { ...b, spent, updatedAt: new Date().toISOString() }
              : b
          ),
        }));
      },

      // ── Goal Actions ─────────────────────────────────────────────────────────
      addGoal: (g) => {
        const now = new Date().toISOString();
        set((s) => ({
          savingsGoals: [...s.savingsGoals, { ...g, id: nanoid(), isCompleted: false, createdAt: now, updatedAt: now }],
        }));
      },

      updateGoal: (id, g) => {
        set((s) => ({
          savingsGoals: s.savingsGoals.map((goal) =>
            goal.id === id ? { ...goal, ...g, updatedAt: new Date().toISOString() } : goal
          ),
        }));
      },

      deleteGoal: (id) => {
        set((s) => ({ savingsGoals: s.savingsGoals.filter((g) => g.id !== id) }));
      },

      addToGoal: (id, amount) => {
        set((s) => ({
          savingsGoals: s.savingsGoals.map((g) => {
            if (g.id !== id) return g;
            const newAmount = Math.min(g.currentAmount + amount, g.targetAmount);
            return { ...g, currentAmount: newAmount, isCompleted: newAmount >= g.targetAmount, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      withdrawFromGoal: (id, amount) => {
        set((s) => ({
          savingsGoals: s.savingsGoals.map((g) => {
            if (g.id !== id) return g;
            const newAmount = Math.max(0, g.currentAmount - amount);
            return { ...g, currentAmount: newAmount, isCompleted: false, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      // ── Recurring Actions ────────────────────────────────────────────────────
      addRecurring: (r) => {
        const now = new Date().toISOString();
        set((s) => ({
          recurringExpenses: [...s.recurringExpenses, { ...r, id: nanoid(), createdAt: now, updatedAt: now }],
        }));
      },

      updateRecurring: (id, r) => {
        set((s) => ({
          recurringExpenses: s.recurringExpenses.map((rec) =>
            rec.id === id ? { ...rec, ...r, updatedAt: new Date().toISOString() } : rec
          ),
        }));
      },

      deleteRecurring: (id) => {
        set((s) => ({ recurringExpenses: s.recurringExpenses.filter((r) => r.id !== id) }));
      },

      toggleRecurring: (id) => {
        set((s) => ({
          recurringExpenses: s.recurringExpenses.map((r) =>
            r.id === id ? { ...r, isActive: !r.isActive, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },

      // ── Category Actions ─────────────────────────────────────────────────────
      addCategory: (c) => {
        set((s) => ({
          categories: [...s.categories, { ...c, id: nanoid(), createdAt: today }],
        }));
      },

      updateCategory: (id, c) => {
        set((s) => ({
          categories: s.categories.map((cat) => (cat.id === id ? { ...cat, ...c } : cat)),
        }));
      },

      deleteCategory: (id) => {
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
      },

      // ── Notification Actions ─────────────────────────────────────────────────
      addNotification: (n) => {
        set((s) => ({
          notifications: [{ ...n, id: nanoid(), createdAt: new Date().toISOString() }, ...s.notifications],
        }));
      },

      markNotificationRead: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        }));
      },

      markAllNotificationsRead: () => {
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, isRead: true })) }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // ── Settings Actions ─────────────────────────────────────────────────────
      updateProfile: (p) => {
        set((s) => ({ profile: { ...s.profile, ...p } }));
      },

      updateSettings: (s) => {
        set((state) => ({ settings: { ...state.settings, ...s } }));
      },

      // ── Data Actions ─────────────────────────────────────────────────────────
      resetToDemo: () => {
        set({
          transactions: [],
          budgets: [],
          savingsGoals: [],
          recurringExpenses: [],
          notifications: [],
        });
      },

      clearAllUserData: () => {
        set({
          transactions: [],
          budgets: [],
          savingsGoals: [],
          recurringExpenses: [],
          notifications: [],
        });
      },
    }),
    {
      name: 'spendly-store-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
