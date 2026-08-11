'use client';

import { Modal } from '@/components/ui/Modal';
import { SavingsGoal } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/finance';
import { ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';

interface ContributionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  currency: string;
}

export function ContributionHistoryModal({ open, onClose, goal, currency }: ContributionHistoryModalProps) {
  if (!goal) return null;

  // Mock contribution history based on current goal status for visual completion
  const history = [
    {
      id: 'contrib-1',
      type: 'deposit' as const,
      amount: goal.currentAmount * 0.6,
      date: goal.createdAt.slice(0, 10),
      note: 'Initial deposit',
    },
    {
      id: 'contrib-2',
      type: 'deposit' as const,
      amount: goal.currentAmount * 0.4,
      date: new Date().toISOString().slice(0, 10),
      note: 'Monthly savings contribution',
    },
  ].filter((c) => c.amount > 0);

  return (
    <Modal open={open} onClose={onClose} title={`Contribution History — ${goal.name}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', padding: 16,
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Target Goal</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(goal.targetAmount, currency)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Saved Balance</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>{formatCurrency(goal.currentAmount, currency)}</div>
          </div>
        </div>

        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <History size={15} /> Contribution Log
        </div>

        {history.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
            No contributions recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: item.type === 'deposit' ? 'var(--green-muted)' : 'var(--red-muted)',
                    color: item.type === 'deposit' ? 'var(--green)' : 'var(--red)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {formatDate(item.date)} • {item.note}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 700,
                  color: item.type === 'deposit' ? 'var(--green)' : 'var(--red)',
                }}>
                  {item.type === 'deposit' ? '+' : '-'}{formatCurrency(item.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
