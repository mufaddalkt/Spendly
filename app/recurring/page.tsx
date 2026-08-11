'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  formatCurrency, formatDate, frequencyLabels, getMonthlyEquivalent, daysUntil
} from '@/lib/utils/finance';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Pause, Play, RefreshCw, Calendar } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { RecurringFormData, RecurringFrequency, PaymentMethod } from '@/types';
import { format, addDays, addWeeks, addMonths, addQuarters, addYears } from 'date-fns';

function DynamicIcon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[name];
  return Icon ? <Icon size={size} color={color} /> : null;
}

const defaultForm: RecurringFormData = {
  name: '',
  amount: '',
  categoryId: '',
  frequency: 'monthly',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  paymentMethod: 'credit_card',
  notes: '',
};

function calcNextPayment(startDate: string, frequency: RecurringFrequency): string {
  const start = new Date(startDate);
  const now = new Date();
  let next = start;
  while (next <= now) {
    switch (frequency) {
      case 'weekly': next = addWeeks(next, 1); break;
      case 'monthly': next = addMonths(next, 1); break;
      case 'quarterly': next = addQuarters(next, 1); break;
      case 'yearly': next = addYears(next, 1); break;
    }
  }
  return format(next, 'yyyy-MM-dd');
}

export default function RecurringPage() {
  const { recurringExpenses, categories, settings, addRecurring, updateRecurring, deleteRecurring, toggleRecurring } = useAppStore();
  const currency = settings.currency;

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<RecurringFormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<RecurringFormData>>({});
  const [loading, setLoading] = useState(false);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const expenseCats = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  const active = recurringExpenses.filter((r) => r.isActive);
  const paused = recurringExpenses.filter((r) => !r.isActive);

  const totalMonthly = useMemo(() =>
    active.reduce((s, r) => s + getMonthlyEquivalent(r.amount, r.frequency), 0),
    [active]
  );

  function openAdd() {
    setEditId(null);
    setForm(defaultForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(id: string) {
    const r = recurringExpenses.find((x) => x.id === id);
    if (!r) return;
    setEditId(id);
    setForm({ name: r.name, amount: String(r.amount), categoryId: r.categoryId, frequency: r.frequency, startDate: r.startDate, paymentMethod: r.paymentMethod, notes: r.notes });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Partial<RecurringFormData> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.categoryId) e.categoryId = 'Select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const nextPayment = calcNextPayment(form.startDate, form.frequency);
    const payload = {
      name: form.name.trim(),
      amount: Number(form.amount),
      categoryId: form.categoryId,
      frequency: form.frequency,
      startDate: form.startDate,
      nextPayment,
      paymentMethod: form.paymentMethod as PaymentMethod,
      isActive: true,
      notes: form.notes,
    };
    if (editId) {
      updateRecurring(editId, payload);
      toast.success('Recurring expense updated');
    } else {
      addRecurring(payload);
      toast.success('Recurring expense added');
    }
    setLoading(false);
    setModalOpen(false);
  }

  const upcomingPayments = useMemo(() => {
    const now = new Date();
    const in30 = format(addDays(now, 30), 'yyyy-MM-dd');
    return active
      .filter((r) => r.nextPayment <= in30)
      .sort((a, b) => a.nextPayment.localeCompare(b.nextPayment));
  }, [active]);

  function RecurringCard({ r, showPaused }: { r: typeof recurringExpenses[0]; showPaused?: boolean }) {
    const cat = catMap[r.categoryId];
    const days = daysUntil(r.nextPayment);
    const monthly = getMonthlyEquivalent(r.amount, r.frequency);
    return (
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: cat ? `${cat.color}20` : 'var(--bg-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <DynamicIcon name={cat?.icon || 'RefreshCw'} size={18} color={cat?.color || 'var(--text-secondary)'} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: showPaused ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{r.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {frequencyLabels[r.frequency]} · {cat?.name || 'Unknown'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => toggleRecurring(r.id)} className="btn btn-ghost btn-icon btn-sm"
              data-tooltip={r.isActive ? 'Pause' : 'Resume'}>
              {r.isActive ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button onClick={() => openEdit(r.id)} className="btn btn-ghost btn-icon btn-sm"><Edit2 size={13} /></button>
            <button onClick={() => setDeleteId(r.id)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Amount</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)' }}>{formatCurrency(r.amount, currency)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Monthly equiv.</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{formatCurrency(monthly, currency)}</div>
          </div>
          {r.isActive && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Next payment</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: days <= 7 ? 'var(--red)' : 'var(--text-primary)' }}>
                {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                {formatDate(r.nextPayment, settings.dateFormat)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Recurring Expenses</h1>
          <p className="page-subtitle">{active.length} active · {formatCurrency(totalMonthly, currency)}/month total</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm">
          <Plus size={13} /> Add Recurring
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div className="stat-label">Active Subscriptions</div>
          <div className="stat-value" style={{ fontSize: 26, marginTop: 6 }}>{active.length}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div className="stat-label">Monthly Total</div>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--red)', marginTop: 6 }}>{formatCurrency(totalMonthly, currency)}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div className="stat-label">Annual Equivalent</div>
          <div className="stat-value" style={{ fontSize: 22, color: 'var(--text-secondary)', marginTop: 6 }}>{formatCurrency(totalMonthly * 12, currency)}</div>
        </div>
      </div>

      {/* Upcoming this month */}
      {upcomingPayments.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={15} color="var(--accent-primary)" />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Due in Next 30 Days</h2>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: 4 }}>
            {upcomingPayments.map((r) => {
              const cat = catMap[r.categoryId];
              const days = daysUntil(r.nextPayment);
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: cat ? `${cat.color}20` : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DynamicIcon name={cat?.icon || 'RefreshCw'} size={13} color={cat?.color} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 12, color: days <= 3 ? 'var(--red)' : 'var(--text-tertiary)' }}>
                    {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--red)', fontSize: 13 }}>{formatCurrency(r.amount, currency)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Active ({active.length})
        </h2>
        {active.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <RefreshCw size={40} style={{ opacity: 0.2, marginBottom: 12, margin: '0 auto 12px' }} />
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No recurring expenses</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Track subscriptions and bills that repeat regularly.</div>
            <button onClick={openAdd} className="btn btn-primary">Add First Recurring</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {active.map((r) => <RecurringCard key={r.id} r={r} />)}
          </div>
        )}
      </div>

      {/* Paused */}
      {paused.length > 0 && (
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Paused ({paused.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, opacity: 0.7 }}>
            {paused.map((r) => <RecurringCard key={r.id} r={r} showPaused />)}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Recurring' : 'Add Recurring'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary" disabled={loading}>Cancel</button>
            <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editId ? 'Update' : 'Add'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" placeholder="Netflix, Rent, Gym..." className={`form-control ${errors.name ? 'error' : ''}`}
              value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" className={`form-control ${errors.amount ? 'error' : ''}`}
                value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              {errors.amount && <span className="form-error">{errors.amount}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select className="form-control" value={form.frequency}
                onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as RecurringFrequency }))}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className={`form-control ${errors.categoryId ? 'error' : ''}`} value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
                <option value="">Select category</option>
                {expenseCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-control" value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select className="form-control" value={form.paymentMethod}
              onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))}>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="apple_pay">Apple Pay</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-control" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteRecurring(deleteId); toast.success('Recurring expense deleted'); setDeleteId(null); } }}
        title="Delete Recurring"
        message="This will permanently delete this recurring expense."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
