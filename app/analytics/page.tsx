'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  formatCurrency, getMonthlySummaries, getCategorySpending, generateInsights
} from '@/lib/utils/finance';
import { format, subDays, startOfDay } from 'date-fns';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
];

export default function AnalyticsPage() {
  const { transactions, categories, budgets, settings } = useAppStore();
  const currency = settings.currency;
  const [range, setRange] = useState(30);

  const now = new Date();
  const cutoff = format(subDays(now, range), 'yyyy-MM-dd');
  const filtered = useMemo(() =>
    transactions.filter((t) => t.date >= cutoff),
    [transactions, cutoff]
  );

  // Monthly summaries (6 months)
  const monthlySummaries = useMemo(() => getMonthlySummaries(transactions, 6), [transactions]);

  // Category spending
  const catSpending = useMemo(() =>
    getCategorySpending(filtered, categories),
    [filtered, categories]
  );

  // Insights
  const insights = useMemo(() =>
    generateInsights(transactions, categories, budgets),
    [transactions, categories, budgets]
  );

  // Daily spending trend
  const dailyData = useMemo(() => {
    const days: Record<string, { date: string; income: number; expenses: number }> = {};
    filtered.forEach((t) => {
      if (!days[t.date]) days[t.date] = { date: t.date, income: 0, expenses: 0 };
      if (t.type === 'income') days[t.date].income += t.amount;
      else days[t.date].expenses += t.amount;
    });
    return Object.values(days)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        ...d,
        dateLabel: format(new Date(d.date), range <= 30 ? 'MMM d' : 'MMM'),
      }));
  }, [filtered, range]);

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Top 10 expenses
  const topExpenses = useMemo(() =>
    filtered
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8),
    [filtered]
  );

  const donutColors = catSpending.slice(0, 6).map((s) => s.color);

  const cashFlowChart = monthlySummaries.map((m) => ({
    month: format(new Date(m.month + '-01'), 'MMM'),
    Income: m.income,
    Expenses: m.expenses,
    Savings: m.savings,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep dive into your financial patterns</p>
        </div>
        {/* Range Selector */}
        <div className="tabs">
          {RANGES.map((r) => (
            <button key={r.days} onClick={() => setRange(r.days)} className={`tab ${range === r.days ? 'active' : ''}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Income', value: totalIncome, color: 'var(--green)' },
          { label: 'Total Expenses', value: totalExpense, color: 'var(--red)' },
          { label: 'Net Savings', value: totalIncome - totalExpense, color: (totalIncome - totalExpense) >= 0 ? 'var(--blue)' : 'var(--red)' },
          { label: 'Savings Rate', value: null, display: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 20 ? 'var(--green)' : savingsRate >= 10 ? 'var(--yellow)' : 'var(--red)' },
        ].map((c) => (
          <div key={c.label} className="card" style={{ padding: '16px 20px' }}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value" style={{ fontSize: 22, color: c.color, marginTop: 6 }}>
              {c.value !== null ? formatCurrency(c.value, currency) : c.display}
            </div>
          </div>
        ))}
      </div>

      {/* Spending Trend + Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Spending Trends</h2>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--red)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--red)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v ?? 0), currency)}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="income" name="Income" stroke="var(--green)" fill="url(#incomeGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="var(--red)" fill="url(#expGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>By Category</h2>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={catSpending.slice(0, 6)} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={2} dataKey="amount">
                  {catSpending.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={donutColors[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(Number(v ?? 0), currency)}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {catSpending.slice(0, 4).map((s) => (
                <div key={s.categoryId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{s.categoryName}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{s.percentage.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Income vs Expenses + Category Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Income vs Expenses chart */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Income vs Expenses (6 months)</h2>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cashFlowChart} barGap={2} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v ?? 0), currency)}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Income" fill="var(--green)" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey="Expenses" fill="var(--red)" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Table */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Category Breakdown</h2>
          </div>
          <div className="card-body" style={{ paddingTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {catSpending.slice(0, 7).map((s) => (
                <div key={s.categoryId} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 0', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0,
                  }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{s.categoryName}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.count} txns</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{formatCurrency(s.amount, currency)}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 999,
                    background: `${s.color}20`, color: s.color, minWidth: 36, textAlign: 'center',
                  }}>
                    {s.percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Expenses + Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Expenses */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Top Expenses</h2>
          </div>
          <div className="card-body" style={{ paddingTop: 4 }}>
            {topExpenses.map((t, i) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 0', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', minWidth: 18 }}>#{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{cat?.name} · {format(new Date(t.date), 'MMM d')}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--red)', fontSize: 14, flexShrink: 0 }}>
                    {formatCurrency(t.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Insights */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lightbulb size={16} color="var(--yellow)" />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Financial Insights</h2>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: 12 }}>
            {insights.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Add more transactions to see insights.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {insights.map((insight, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    padding: 14, borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: 'var(--yellow-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Lightbulb size={14} color="var(--yellow)" />
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
