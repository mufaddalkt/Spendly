'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatCurrency, calcPercentage, daysUntil } from '@/lib/utils/finance';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Target, CheckCircle, PlusCircle, MinusCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { GoalFormData } from '@/types';
import { format, differenceInDays } from 'date-fns';

function DynamicIcon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[name];
  return Icon ? <Icon size={size} color={color} /> : null;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];
const ICONS = ['Target', 'Shield', 'Car', 'Plane', 'Home', 'Laptop', 'Heart', 'Gift', 'Star', 'Trophy'];

const defaultForm: GoalFormData = {
  name: '',
  targetAmount: '',
  currentAmount: '0',
  targetDate: format(new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1), 'yyyy-MM-dd'),
  description: '',
  color: '#10b981',
  icon: 'Target',
};

export default function GoalsPage() {
  const { savingsGoals, addGoal, updateGoal, deleteGoal, addToGoal, withdrawFromGoal, settings } = useAppStore();
  const currency = settings.currency;

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addMoneyId, setAddMoneyId] = useState<string | null>(null);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [moneyAmount, setMoneyAmount] = useState('');
  const [form, setForm] = useState<GoalFormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<GoalFormData>>({});
  const [loading, setLoading] = useState(false);

  const activeGoals = savingsGoals.filter((g) => !g.isCompleted);
  const completedGoals = savingsGoals.filter((g) => g.isCompleted);

  const totalTarget = activeGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = activeGoals.reduce((s, g) => s + g.currentAmount, 0);

  function openAdd() {
    setEditId(null);
    setForm(defaultForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(id: string) {
    const g = savingsGoals.find((x) => x.id === id);
    if (!g) return;
    setEditId(id);
    setForm({
      name: g.name, targetAmount: String(g.targetAmount),
      currentAmount: String(g.currentAmount), targetDate: g.targetDate,
      description: g.description, color: g.color, icon: g.icon,
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Partial<GoalFormData> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.targetAmount || isNaN(Number(form.targetAmount)) || Number(form.targetAmount) <= 0) e.targetAmount = 'Enter a valid amount';
    if (!form.targetDate) e.targetDate = 'Select a target date';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const payload = {
      name: form.name.trim(),
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount) || 0,
      targetDate: form.targetDate,
      description: form.description,
      color: form.color,
      icon: form.icon,
    };
    if (editId) {
      updateGoal(editId, payload);
      toast.success('Goal updated');
    } else {
      addGoal(payload);
      toast.success('Goal created!');
    }
    setLoading(false);
    setModalOpen(false);
  }

  function handleAddMoney() {
    const amt = Number(moneyAmount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (addMoneyId) {
      addToGoal(addMoneyId, amt);
      const goal = savingsGoals.find((g) => g.id === addMoneyId);
      const pct = goal ? calcPercentage(goal.currentAmount + amt, goal.targetAmount) : 0;
      if (pct >= 100) toast.success('🎉 Goal completed!');
      else toast.success(`Added ${formatCurrency(amt, currency)}`);
    }
    setAddMoneyId(null);
    setMoneyAmount('');
  }

  function handleWithdraw() {
    const amt = Number(moneyAmount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (withdrawId) {
      withdrawFromGoal(withdrawId, amt);
      toast.success(`Withdrew ${formatCurrency(amt, currency)}`);
    }
    setWithdrawId(null);
    setMoneyAmount('');
  }

  function Milestones({ pct }: { pct: number }) {
    return (
      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
        {[25, 50, 75, 100].map((m) => (
          <div key={m} style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '2px 7px', borderRadius: 999, fontSize: 10, fontWeight: 600,
            background: pct >= m ? 'var(--green-muted)' : 'var(--bg-tertiary)',
            color: pct >= m ? 'var(--green)' : 'var(--text-tertiary)',
          }}>
            {pct >= m && '✓'} {m}%
          </div>
        ))}
      </div>
    );
  }

  function GoalCard({ goal }: { goal: typeof savingsGoals[0] }) {
    const pct = calcPercentage(goal.currentAmount, goal.targetAmount);
    const days = differenceInDays(new Date(goal.targetDate), new Date());
    const remaining = goal.targetAmount - goal.currentAmount;
    return (
      <div className="card" style={{ padding: '20px', opacity: goal.isCompleted ? 0.85 : 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: `${goal.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <DynamicIcon name={goal.icon} size={20} color={goal.color} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{goal.name}</div>
              {goal.description && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{goal.description}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {!goal.isCompleted && <>
              <button onClick={() => { setAddMoneyId(goal.id); setMoneyAmount(''); }} className="btn btn-ghost btn-icon btn-sm" data-tooltip="Add money">
                <PlusCircle size={14} color="var(--green)" />
              </button>
              <button onClick={() => { setWithdrawId(goal.id); setMoneyAmount(''); }} className="btn btn-ghost btn-icon btn-sm" data-tooltip="Withdraw">
                <MinusCircle size={14} color="var(--red)" />
              </button>
            </>}
            <button onClick={() => openEdit(goal.id)} className="btn btn-ghost btn-icon btn-sm"><Edit2 size={13} /></button>
            <button onClick={() => setDeleteId(goal.id)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
          </div>
        </div>

        {/* Amounts */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Saved</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: goal.color }}>
              {formatCurrency(goal.currentAmount, currency)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Target</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatCurrency(goal.targetAmount, currency)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar" style={{ height: 10, marginBottom: 8 }}>
          <div className="progress-fill healthy" style={{ width: `${Math.min(100, pct)}%`, background: goal.color }} />
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
          <span style={{ fontWeight: 700, color: goal.color }}>{pct.toFixed(1)}% complete</span>
          {!goal.isCompleted && <span>{formatCurrency(remaining, currency)} remaining</span>}
          {goal.isCompleted ? (
            <span style={{ color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={13} /> Completed!
            </span>
          ) : (
            <span style={{ color: days < 0 ? 'var(--red)' : days < 30 ? 'var(--yellow)' : 'var(--text-secondary)' }}>
              {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`}
            </span>
          )}
        </div>

        <Milestones pct={pct} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">{activeGoals.length} active goals · {formatCurrency(totalSaved, currency)} saved of {formatCurrency(totalTarget, currency)}</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm">
          <Plus size={13} /> New Goal
        </button>
      </div>

      {/* Active Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {activeGoals.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1', padding: 48, textAlign: 'center' }}>
            <Target size={40} style={{ opacity: 0.2, marginBottom: 12, margin: '0 auto 12px' }} />
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No savings goals yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Set financial targets and track your progress.</div>
            <button onClick={openAdd} className="btn btn-primary">Create First Goal</button>
          </div>
        ) : (
          activeGoals.map((g) => <GoalCard key={g.id} goal={g} />)
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Completed ({completedGoals.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {completedGoals.map((g) => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {/* Goal CRUD Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Goal' : 'Create Goal'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary" disabled={loading}>Cancel</button>
            <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editId ? 'Update Goal' : 'Create Goal'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Goal Name</label>
            <input type="text" placeholder="Emergency Fund, Vacation..." className={`form-control ${errors.name ? 'error' : ''}`}
              value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Target Amount</label>
              <input type="number" min="1" placeholder="5000" className={`form-control ${errors.targetAmount ? 'error' : ''}`}
                value={form.targetAmount} onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))} />
              {errors.targetAmount && <span className="form-error">{errors.targetAmount}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Current Amount</label>
              <input type="number" min="0" placeholder="0" className="form-control"
                value={form.currentAmount} onChange={(e) => setForm((f) => ({ ...f, currentAmount: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Target Date</label>
            <input type="date" className={`form-control ${errors.targetDate ? 'error' : ''}`}
              value={form.targetDate} onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} />
            {errors.targetDate && <span className="form-error">{errors.targetDate}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea className="form-control" value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          {/* Color Picker */}
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map((c) => (
                <div key={c} className={`color-swatch ${form.color === c ? 'selected' : ''}`}
                  style={{ background: c }} onClick={() => setForm((f) => ({ ...f, color: c }))} />
              ))}
            </div>
          </div>
          {/* Icon Picker */}
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ICONS.map((icon) => (
                <div key={icon} onClick={() => setForm((f) => ({ ...f, icon }))}
                  style={{
                    width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: form.icon === icon ? 'var(--accent-muted)' : 'var(--bg-tertiary)',
                    border: `2px solid ${form.icon === icon ? 'var(--accent-primary)' : 'transparent'}`,
                    transition: 'all var(--transition)',
                  }}>
                  <DynamicIcon name={icon} size={16} color={form.icon === icon ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Money Modal */}
      <Modal open={!!addMoneyId} onClose={() => setAddMoneyId(null)} title="Add Money" size="sm"
        footer={
          <>
            <button onClick={() => setAddMoneyId(null)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleAddMoney} className="btn btn-primary">Add</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Amount to Add</label>
          <input type="number" min="0.01" step="0.01" autoFocus className="form-control" placeholder="0.00"
            value={moneyAmount} onChange={(e) => setMoneyAmount(e.target.value)} />
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal open={!!withdrawId} onClose={() => setWithdrawId(null)} title="Withdraw from Goal" size="sm"
        footer={
          <>
            <button onClick={() => setWithdrawId(null)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleWithdraw} className="btn btn-danger">Withdraw</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Amount to Withdraw</label>
          <input type="number" min="0.01" step="0.01" autoFocus className="form-control" placeholder="0.00"
            value={moneyAmount} onChange={(e) => setMoneyAmount(e.target.value)} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) { deleteGoal(deleteId); toast.success('Goal deleted'); setDeleteId(null); } }}
        title="Delete Goal"
        message="This will permanently delete this savings goal and all associated data."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
