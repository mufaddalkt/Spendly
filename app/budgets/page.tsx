'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatCurrency, calcPercentage, formatMonth } from '@/lib/utils/finance';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Budget, BudgetFormData } from '@/types';
import { format, addMonths, subMonths } from 'date-fns';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

function DynamicIcon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[name];
  return Icon ? <Icon size={size} color={color} /> : null;
}

const defaultForm: BudgetFormData = {
  categoryId: '',
  limit: '',
  month: format(new Date(), 'yyyy-MM'),
};

export default function BudgetsPage() {
  const { budgets, categories, transactions, addBudget, updateBudget, deleteBudget, settings } = useAppStore();
  const currency = settings.currency;

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<BudgetFormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<BudgetFormData>>({});
  const [loading, setLoading] = useState(false);
  const [viewMonth, setViewMonth] = useState(format(new Date(), 'yyyy-MM'));

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const monthBudgets = useMemo(() => {
    return budgets
      .filter((b) => b.month === viewMonth)
      .map((b) => {
        const category = catMap[b.categoryId] || { id: b.categoryId, name: 'Unknown', color: '#6b7280', icon: 'MoreHorizontal' };
        const spent = transactions
          .filter((t) => t.categoryId === b.categoryId && t.date.startsWith(viewMonth) && t.type === 'expense')
          .reduce((s, t) => s + t.amount, 0);
        const percentage = calcPercentage(spent, b.limit);
        return {
          ...b, spent, category, percentage,
          remaining: Math.max(0, b.limit - spent),
          status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'healthy',
        };
      });
  }, [budgets, transactions, viewMonth, catMap]);

  const totalLimit = monthBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalLimit - totalSpent;
  const overallPct = calcPercentage(totalSpent, totalLimit);

  // Chart data
  const chartData = monthBudgets.map((b) => ({
    name: b.category.name,
    Budget: b.limit,
    Spent: b.spent,
    color: (b.category as typeof categories[0]).color,
  }));

  function openAdd() {
    setEditId(null);
    setForm(defaultForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(b: typeof monthBudgets[0]) {
    setEditId(b.id);
    setForm({ categoryId: b.categoryId, limit: String(b.limit), month: b.month });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Partial<BudgetFormData> = {};
    if (!form.categoryId) e.categoryId = 'Select a category';
    if (!form.limit || isNaN(Number(form.limit)) || Number(form.limit) <= 0) e.limit = 'Enter a valid amount';
    if (!form.month) e.month = 'Select a month';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    if (editId) {
      updateBudget(editId, { categoryId: form.categoryId, limit: Number(form.limit), month: form.month });
      toast.success('Budget updated');
    } else {
      // Check for duplicate
      const exists = budgets.find((b) => b.categoryId === form.categoryId && b.month === form.month);
      if (exists) {
        toast.error('A budget for this category and month already exists');
        setLoading(false);
        return;
      }
      addBudget({ categoryId: form.categoryId, limit: Number(form.limit), month: form.month });
      toast.success('Budget created');
    }
    setLoading(false);
    setModalOpen(false);
  }

  const statusConfig = {
    healthy: { color: 'var(--green)', label: 'On Track', icon: CheckCircle },
    warning: { color: 'var(--yellow)', label: 'Warning', icon: AlertTriangle },
    exceeded: { color: 'var(--red)', label: 'Over Budget', icon: TrendingDown },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Monitor your spending limits for {formatMonth(viewMonth)}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Month Navigator */}
          <button onClick={() => setViewMonth(format(subMonths(new Date(viewMonth + '-01'), 1), 'yyyy-MM'))} className="btn btn-secondary btn-sm">←</button>
          <span style={{ fontSize: 13, fontWeight: 500, minWidth: 110, textAlign: 'center' }}>{formatMonth(viewMonth)}</span>
          <button onClick={() => setViewMonth(format(addMonths(new Date(viewMonth + '-01'), 1), 'yyyy-MM'))} className="btn btn-secondary btn-sm">→</button>
          <button onClick={openAdd} className="btn btn-primary btn-sm">
            <Plus size={13} /> Add Budget
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Budget', value: totalLimit, color: 'var(--accent-primary)', bg: 'var(--accent-muted)' },
          { label: 'Total Spent', value: totalSpent, color: 'var(--red)', bg: 'var(--red-muted)' },
          { label: 'Remaining', value: totalRemaining, color: totalRemaining >= 0 ? 'var(--green)' : 'var(--red)', bg: totalRemaining >= 0 ? 'var(--green-muted)' : 'var(--red-muted)' },
        ].map((c) => (
          <div key={c.label} className="card" style={{ padding: '16px 20px' }}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value" style={{ fontSize: 22, color: c.color, marginTop: 6 }}>
              {formatCurrency(c.value, currency)}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Budget vs Spending</h2>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v ?? 0), currency)}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Budget" fill="var(--border-default)" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="Spent" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Budget Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {monthBudgets.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No budgets for {formatMonth(viewMonth)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Create budgets to track your spending by category.</div>
            <button onClick={openAdd} className="btn btn-primary">
              <Plus size={14} /> Create Budget
            </button>
          </div>
        ) : (
          monthBudgets.map((b) => {
            const StatusIcon = statusConfig[b.status as keyof typeof statusConfig].icon;
            const statusColor = statusConfig[b.status as keyof typeof statusConfig].color;
            return (
              <div key={b.id} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: `${(b.category as typeof categories[0]).color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <DynamicIcon name={(b.category as typeof categories[0]).icon} size={18} color={(b.category as typeof categories[0]).color} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{b.category.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <StatusIcon size={11} color={statusColor} />
                        <span style={{ fontSize: 11, color: statusColor, fontWeight: 500 }}>
                          {statusConfig[b.status as keyof typeof statusConfig].label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openEdit(b)} className="btn btn-ghost btn-icon btn-sm"><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteId(b.id)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
                  </div>
                </div>

                {/* Amounts */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Spent</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: b.status === 'exceeded' ? 'var(--red)' : 'var(--text-primary)' }}>
                      {formatCurrency(b.spent, currency)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Remaining</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: b.remaining > 0 ? 'var(--green)' : 'var(--red)' }}>
                      {formatCurrency(b.remaining, currency)}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="progress-bar" style={{ height: 8, marginBottom: 6 }}>
                  <div
                    className={`progress-fill ${b.status}`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <span>{b.percentage.toFixed(0)}% used</span>
                  <span>Limit: {formatCurrency(b.limit, currency)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Budget' : 'Create Budget'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary" disabled={loading}>Cancel</button>
            <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editId ? 'Update Budget' : 'Create Budget'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className={`form-control ${errors.categoryId ? 'error' : ''}`} value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Select category</option>
              {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Limit</label>
            <input type="number" min="1" step="1" placeholder="500" className={`form-control ${errors.limit ? 'error' : ''}`}
              value={form.limit} onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))} />
            {errors.limit && <span className="form-error">{errors.limit}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Month</label>
            <input type="month" className={`form-control ${errors.month ? 'error' : ''}`}
              value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))} />
            {errors.month && <span className="form-error">{errors.month}</span>}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteBudget(deleteId); toast.success('Budget deleted'); setDeleteId(null); } }}
        title="Delete Budget"
        message="This will permanently delete this budget."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
