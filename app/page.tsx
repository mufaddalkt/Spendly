'use client';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  formatCurrency, formatCompact, formatDateShort,
  getMonthlyTotals, getMonthlySummaries, getCategorySpending, calcChange, calcPercentage
} from '@/lib/utils/finance';
import { TrendingUp, TrendingDown, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { BudgetWithCategory } from '@/types';

import { calculateFinancialHealthScore } from '@/lib/utils/healthScore';
import { Activity, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { transactions, budgets, savingsGoals, recurringExpenses, categories, settings, profile } = useAppStore();
  const currency = settings.currency;

  const now = new Date();
  const currentMonth = format(now, 'yyyy-MM');
  const lastMonth = format(new Date(now.getFullYear(), now.getMonth() - 1, 1), 'yyyy-MM');
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.name ? profile.name.split(' ')[0] : 'User';

  const healthScore = useMemo(
    () => calculateFinancialHealthScore(transactions, budgets, recurringExpenses, currentMonth),
    [transactions, budgets, recurringExpenses, currentMonth]
  );

  const activeRecurring = useMemo(() => recurringExpenses.filter((r) => r.isActive), [recurringExpenses]);
  const monthlyRecurringTotal = useMemo(() => activeRecurring.reduce((s, r) => s + r.amount, 0), [activeRecurring]);
  const annualRecurringTotal = monthlyRecurringTotal * 12;

  const current = useMemo(() => getMonthlyTotals(transactions, currentMonth), [transactions, currentMonth]);
  const previous = useMemo(() => getMonthlyTotals(transactions, lastMonth), [transactions, lastMonth]);

  const incomeChange = calcChange(current.income, previous.income);
  const expenseChange = calcChange(current.expenses, previous.expenses);
  const savingsChange = calcChange(current.savings, previous.savings);

  // Balance = all-time income - all-time expenses
  const totalBalance = useMemo(() =>
    transactions.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0),
    [transactions]
  );

  // Cash flow chart (last 6 months)
  const cashFlowData = useMemo(() => getMonthlySummaries(transactions, 6).map((m) => ({
    month: format(new Date(m.month + '-01'), 'MMM'),
    Income: m.income,
    Expenses: m.expenses,
    Savings: m.savings,
  })), [transactions]);

  // Spending donut
  const spending = useMemo(() => getCategorySpending(transactions, categories, currentMonth), [transactions, categories, currentMonth]);
  const donutData = spending.slice(0, 7).map((s) => ({ name: s.categoryName, value: s.amount, color: s.color }));

  // Budget overview
  const currentBudgets = useMemo((): BudgetWithCategory[] =>
    budgets
      .filter((b) => b.month === currentMonth)
      .map((b) => {
        const category = categories.find((c) => c.id === b.categoryId) || { id: b.categoryId, name: 'Unknown', color: '#6b7280', icon: 'MoreHorizontal', type: 'expense' as const, isCustom: false, createdAt: '' };
        const percentage = calcPercentage(b.spent, b.limit);
        return {
          ...b, category, percentage,
          remaining: Math.max(0, b.limit - b.spent),
          status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'healthy',
        } as BudgetWithCategory;
      }),
    [budgets, categories, currentMonth]
  );

  // Recent transactions
  const recentTxns = useMemo(() =>
    [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [transactions]
  );

  // Active goals
  const activeGoals = useMemo(() => savingsGoals.filter((g) => !g.isCompleted).slice(0, 3), [savingsGoals]);

  // Upcoming payments (next 30 days)
  const upcomingPayments = useMemo(() => {
    const today = format(now, 'yyyy-MM-dd');
    const future = format(new Date(now.getTime() + 30 * 86400000), 'yyyy-MM-dd');
    return recurringExpenses
      .filter((r) => r.isActive && r.nextPayment >= today && r.nextPayment <= future)
      .sort((a, b) => a.nextPayment.localeCompare(b.nextPayment))
      .slice(0, 4);
  }, [recurringExpenses, now]);

  const statCards = [
    {
      label: 'Total Balance',
      value: totalBalance,
      change: null,
      color: 'var(--accent-primary)',
      bg: 'var(--accent-muted)',
      icon: 'Wallet',
    },
    {
      label: 'Monthly Income',
      value: current.income,
      change: incomeChange,
      positive: true,
      color: 'var(--green)',
      bg: 'var(--green-muted)',
      icon: 'TrendingUp',
    },
    {
      label: 'Monthly Expenses',
      value: current.expenses,
      change: expenseChange,
      positive: false,
      color: 'var(--red)',
      bg: 'var(--red-muted)',
      icon: 'TrendingDown',
    },
    {
      label: 'Monthly Savings',
      value: current.savings,
      change: savingsChange,
      positive: true,
      color: 'var(--blue)',
      bg: 'var(--blue-muted)',
      icon: 'PiggyBank',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4 }}>
            {format(now, 'EEEE, MMMM d, yyyy')}
          </div>
          <h1 className="page-title">{greeting}, {firstName} 👋</h1>
          <p className="page-subtitle">Here&apos;s your financial overview for {format(now, 'MMMM yyyy')}</p>
        </div>
      </div>

      {/* Financial Health Card */}
      <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-hover) 100%)', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--accent-muted)', border: '3px solid var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontWeight: 800, fontSize: 20, color: 'var(--accent-primary)',
            }}>
              {healthScore.score}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={16} color="var(--accent-primary)" />
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Financial Health Score</h2>
                <span className="badge badge-info">{healthScore.rating}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
                {healthScore.disclaimer}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {healthScore.factors.map((factor) => (
              <div key={factor.name} style={{
                padding: '6px 12px', background: 'var(--bg-card)',
                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                fontSize: 11, display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>{factor.name}</span>
                <span style={{
                  fontWeight: 700,
                  color: factor.status === 'positive' ? 'var(--green)' : factor.status === 'warning' ? 'var(--yellow)' : 'var(--red)',
                }}>
                  {factor.score}/100 • {factor.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {statCards.map((card) => {
          const dir = card.change?.direction;
          return (
            <div key={card.label} className="card stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="stat-label">{card.label}</span>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                  background: card.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <DynamicIcon name={card.icon} size={18} color={card.color} />
                </div>
              </div>
              <div className="stat-value" style={{ color: card.value < 0 ? 'var(--red)' : undefined }}>
                {formatCompact(card.value, currency)}
              </div>
              {card.change && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`stat-change ${dir}`}>
                    {dir === 'up' ? <TrendingUp size={11} /> : dir === 'down' ? <TrendingDown size={11} /> : <Minus size={11} />}
                    {card.change.percentage.toFixed(1)}%
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>vs last month</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* Cash Flow Chart */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 4 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Cash Flow</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>Last 6 months</p>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={cashFlowData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip
                  formatter={(v: any, name: any) => [formatCurrency(Number(v ?? 0), currency), name]}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="Income" fill="var(--green)" radius={[4, 4, 0, 0]} barSize={14} opacity={0.85} />
                <Bar dataKey="Expenses" fill="var(--red)" radius={[4, 4, 0, 0]} barSize={14} opacity={0.85} />
                <Line dataKey="Savings" stroke="var(--accent-primary)" strokeWidth={2} dot={{ r: 3, fill: 'var(--accent-primary)' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending Donut */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Spending</h2>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [formatCurrency(Number(v ?? 0), currency)]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {donutData.slice(0, 4).map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>{formatCurrency(d.value, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Budgets + Recent Transactions row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Budget Overview */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Budget Overview</h2>
            <Link href="/budgets" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card-body" style={{ paddingTop: 12 }}>
            {currentBudgets.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>No budgets for this month</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {currentBudgets.slice(0, 5).map((b) => (
                  <div key={b.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 6,
                          background: `${b.category.color}20`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <DynamicIcon name={b.category.icon} size={13} color={b.category.color} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{b.category.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: 12, fontWeight: 600,
                          color: b.status === 'exceeded' ? 'var(--red)' : b.status === 'warning' ? 'var(--yellow)' : 'var(--text-secondary)',
                        }}>
                          {formatCurrency(b.spent, currency)}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}> / {formatCurrency(b.limit, currency)}</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${b.status}`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Transactions</h2>
            <Link href="/transactions" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card-body" style={{ paddingTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentTxns.map((t) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                return (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: cat ? `${cat.color}20` : 'var(--bg-tertiary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <DynamicIcon name={cat?.icon || 'MoreHorizontal'} size={15} color={cat?.color || 'var(--text-secondary)'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.description}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        {formatDateShort(t.date)} · {cat?.name || 'Unknown'}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 600, flexShrink: 0,
                      color: t.type === 'income' ? 'var(--green)' : 'var(--red)',
                    }}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Goals + Upcoming Payments row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Savings Goals */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Savings Goals</h2>
            <Link href="/goals" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card-body" style={{ paddingTop: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeGoals.map((g) => {
                const pct = calcPercentage(g.currentAmount, g.targetAmount);
                return (
                  <div key={g.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: `${g.color}20`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <DynamicIcon name={g.icon} size={14} color={g.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{g.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            {formatCurrency(g.currentAmount, currency)} of {formatCurrency(g.targetAmount, currency)}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: g.color }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill healthy" style={{ width: `${pct}%`, background: g.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Payments & Recurring Summary */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Recurring Summary</h2>
            <Link href="/recurring" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div style={{ padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Monthly Cost</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(monthlyRecurringTotal, currency)}</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Est. Annual</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(annualRecurringTotal, currency)}</div>
              </div>
              <div style={{ padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Subscriptions</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)' }}>{activeRecurring.length} Active</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {upcomingPayments.length === 0 ? (
                <div className="empty-state" style={{ padding: 24 }}>
                  <ShieldCheck size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 13 }}>No upcoming payments in 30 days</p>
                </div>
              ) : (
                upcomingPayments.map((r) => {
                  const cat = categories.find((c) => c.id === r.categoryId);
                  const daysLeft = Math.ceil((new Date(r.nextPayment).getTime() - now.getTime()) / 86400000);
                  return (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: cat ? `${cat.color}20` : 'var(--bg-tertiary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <DynamicIcon name={cat?.icon || 'RefreshCw'} size={15} color={cat?.color || 'var(--text-secondary)'} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: daysLeft <= 3 ? 'var(--red)' : 'var(--text-tertiary)' }}>
                          {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`}
                        </div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', flexShrink: 0 }}>
                        -{formatCurrency(r.amount, currency)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .charts-row, .mid-row, .bottom-row { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .stat-cards { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
