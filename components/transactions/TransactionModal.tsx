'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { TransactionFormData, TransactionType, PaymentMethod } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { format } from 'date-fns';
import { toast } from 'sonner';

const defaultForm: TransactionFormData = {
  description: '',
  amount: '',
  type: 'expense',
  categoryId: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  paymentMethod: 'credit_card',
  account: 'Checking',
  notes: '',
};

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  editId?: string | null;
}

export function TransactionModal({ open, onClose, editId }: TransactionModalProps) {
  const { transactions, categories, addTransaction, updateTransaction } = useAppStore();
  const existing = editId ? transactions.find((t) => t.id === editId) : null;

  const [form, setForm] = useState<TransactionFormData>(() => {
    if (existing) {
      return {
        description: existing.description,
        amount: String(existing.amount),
        type: existing.type,
        categoryId: existing.categoryId,
        date: existing.date,
        paymentMethod: existing.paymentMethod,
        account: existing.account,
        notes: existing.notes,
      };
    }
    return defaultForm;
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');
  const incomeCategories = categories.filter((c) => c.type === 'income' || c.type === 'both');
  const currentCategories = form.type === 'expense' ? expenseCategories : incomeCategories;

  const set = useCallback((k: keyof TransactionFormData, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }, []);

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      newErrors.amount = 'Enter a valid positive amount';
    }
    if (!form.categoryId) newErrors.categoryId = 'Please select a category';
    if (!form.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300)); // simulate async
    const payload = {
      description: form.description.trim(),
      amount: Number(form.amount),
      type: form.type,
      categoryId: form.categoryId,
      date: form.date,
      paymentMethod: form.paymentMethod,
      account: form.account,
      notes: form.notes,
      isRecurring: false,
    };
    if (editId) {
      updateTransaction(editId, payload);
      toast.success('Transaction updated');
    } else {
      addTransaction(payload);
      toast.success('Transaction added');
    }
    setLoading(false);
    setForm(defaultForm);
    onClose();
  }

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'apple_pay', label: 'Apple Pay' },
    { value: 'google_pay', label: 'Google Pay' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editId ? 'Edit Transaction' : 'Add Transaction'}
      footer={
        <>
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : editId ? 'Save Changes' : 'Add Transaction'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Type Toggle */}
        <div className="type-toggle">
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => { set('type', t); set('categoryId', ''); }}
              className={`type-toggle-btn ${form.type === t ? `active-${t}` : ''}`}
            >
              {t === 'expense' ? '💸 Expense' : '💰 Income'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-secondary)', fontWeight: 600, fontSize: 15,
            }}>$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`form-control ${errors.amount ? 'error' : ''}`}
              style={{ paddingLeft: 28, fontSize: 18, fontWeight: 600 }}
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
            />
          </div>
          {errors.amount && <span className="form-error">{errors.amount}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            placeholder="What was this for?"
            className={`form-control ${errors.description ? 'error' : ''}`}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>

        {/* Category & Date side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className={`form-control ${errors.categoryId ? 'error' : ''}`}
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
            >
              <option value="">Select category</option>
              {currentCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className={`form-control ${errors.date ? 'error' : ''}`}
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>
        </div>

        {/* Payment Method & Account */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-control"
              value={form.paymentMethod}
              onChange={(e) => set('paymentMethod', e.target.value as PaymentMethod)}
            >
              {paymentMethods.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Account</label>
            <select
              className="form-control"
              value={form.account}
              onChange={(e) => set('account', e.target.value)}
            >
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Investment">Investment</option>
              <option value="Cash">Cash</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea
            placeholder="Add any notes..."
            className="form-control"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
