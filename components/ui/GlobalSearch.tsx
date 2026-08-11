'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, ArrowLeftRight, PieChart, Target, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatCurrency } from '@/lib/utils/finance';
import { useRouter } from 'next/navigation';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const { transactions, categories, budgets, savingsGoals, recurringExpenses, settings } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!open) { setQuery(''); return; }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const q = query.toLowerCase();

  const results = q.length < 2 ? [] : [
    ...transactions
      .filter((t) => t.description.toLowerCase().includes(q) || (catMap[t.categoryId]?.name || '').toLowerCase().includes(q))
      .slice(0, 4)
      .map((t) => ({
        id: t.id, type: 'transaction' as const,
        label: t.description,
        sub: catMap[t.categoryId]?.name || '',
        amount: (t.type === 'expense' ? -1 : 1) * t.amount,
        href: '/transactions',
        icon: ArrowLeftRight,
      })),
    ...budgets
      .filter((b) => (catMap[b.categoryId]?.name || '').toLowerCase().includes(q))
      .slice(0, 2)
      .map((b) => ({
        id: b.id, type: 'budget' as const,
        label: `${catMap[b.categoryId]?.name || 'Budget'} Budget`,
        sub: `${b.month}`,
        amount: b.limit,
        href: '/budgets',
        icon: PieChart,
      })),
    ...savingsGoals
      .filter((g) => g.name.toLowerCase().includes(q))
      .slice(0, 2)
      .map((g) => ({
        id: g.id, type: 'goal' as const,
        label: g.name,
        sub: 'Savings Goal',
        amount: g.targetAmount,
        href: '/goals',
        icon: Target,
      })),
    ...recurringExpenses
      .filter((r) => r.name.toLowerCase().includes(q))
      .slice(0, 2)
      .map((r) => ({
        id: r.id, type: 'recurring' as const,
        label: r.name,
        sub: 'Recurring',
        amount: r.amount,
        href: '/recurring',
        icon: RefreshCw,
      })),
  ];

  function navigate(href: string) {
    router.push(href);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="search-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border-default)' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input
            autoFocus
            type="text"
            placeholder="Search transactions, budgets, goals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 15,
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="btn btn-ghost btn-icon">
              <X size={16} />
            </button>
          )}
        </div>

        {query.length >= 2 && (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {results.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(r.href)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    transition: 'background var(--transition)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <r.icon size={16} color="var(--text-secondary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.sub}</div>
                  </div>
                  <span style={{
                    fontWeight: 600, fontSize: 13,
                    color: r.amount < 0 ? 'var(--red)' : 'var(--green)',
                    flexShrink: 0,
                  }}>
                    {r.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(r.amount), settings.currency)}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {query.length < 2 && (
          <div style={{ padding: '12px 16px 16px', color: 'var(--text-tertiary)', fontSize: 12 }}>
            Type at least 2 characters to search
          </div>
        )}

        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-tertiary)' }}>
          <span>↵ Select</span>
          <span>Esc Close</span>
          <span>⌘K Toggle</span>
        </div>
      </div>
    </div>
  );
}
