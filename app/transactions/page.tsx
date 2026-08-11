'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  formatCurrency, formatDate, exportTransactionsCSV, paymentMethodLabels
} from '@/lib/utils/finance';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import {
  Search, Filter, Download, Trash2, Plus, ChevronUp, ChevronDown,
  Copy, Edit2, MoreHorizontal, ArrowUpRight, ArrowDownLeft, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Transaction, TransactionFilters, SortConfig, SortField } from '@/types';
import { format } from 'date-fns';

const PAGE_SIZE = 25;

function DynamicIcon({ name, size = 14, color }: { name: string; size?: number; color?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[name];
  return Icon ? <Icon size={size} color={color} /> : null;
}

export default function TransactionsPage() {
  const { transactions, categories, settings, deleteTransaction, deleteTransactions, addTransaction } = useAppStore();
  const currency = settings.currency;

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingMany, setDeletingMany] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: 'all',
    categoryId: '',
    paymentMethod: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const [sort, setSort] = useState<SortConfig>({ field: 'date', direction: 'desc' });

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((t) =>
        t.description.toLowerCase().includes(q) ||
        (catMap[t.categoryId]?.name || '').toLowerCase().includes(q) ||
        (t.notes || '').toLowerCase().includes(q)
      );
    }
    if (filters.type !== 'all') result = result.filter((t) => t.type === filters.type);
    if (filters.categoryId) result = result.filter((t) => t.categoryId === filters.categoryId);
    if (filters.paymentMethod !== 'all') result = result.filter((t) => t.paymentMethod === filters.paymentMethod);
    if (filters.dateFrom) result = result.filter((t) => t.date >= filters.dateFrom);
    if (filters.dateTo) result = result.filter((t) => t.date <= filters.dateTo);

    result.sort((a, b) => {
      let cmp = 0;
      if (sort.field === 'date') cmp = a.date.localeCompare(b.date);
      else if (sort.field === 'amount') cmp = a.amount - b.amount;
      else if (sort.field === 'description') cmp = a.description.localeCompare(b.description);
      else if (sort.field === 'category') cmp = (catMap[a.categoryId]?.name || '').localeCompare(catMap[b.categoryId]?.name || '');
      return sort.direction === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [transactions, filters, sort, catMap]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(field: SortField) {
    setSort((s) => ({ field, direction: s.field === field && s.direction === 'asc' ? 'desc' : 'asc' }));
    setPage(1);
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sort.field !== field) return <ChevronUp size={12} style={{ opacity: 0.3 }} />;
    return sort.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  }

  function toggleSelect(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  function toggleSelectAll() {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((t) => t.id)));
    }
  }

  function handleEdit(id: string) {
    setEditId(id);
    setModalOpen(true);
  }

  function handleDuplicate(t: Transaction) {
    addTransaction({
      description: `${t.description} (copy)`,
      amount: t.amount,
      type: t.type,
      categoryId: t.categoryId,
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: t.paymentMethod,
      account: t.account,
      notes: t.notes,
      isRecurring: false,
    });
    toast.success('Transaction duplicated');
  }

  function handleBulkDelete() {
    deleteTransactions([...selected]);
    setSelected(new Set());
    setDeletingMany(false);
    toast.success(`${selected.size} transactions deleted`);
  }

  function setFilter(k: keyof TransactionFilters, v: string) {
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(1);
  }

  const activeFilterCount = [
    filters.type !== 'all', filters.categoryId, filters.paymentMethod !== 'all',
    filters.dateFrom, filters.dateTo,
  ].filter(Boolean).length;

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{filtered.length} transactions · {formatCurrency(totalIncome, currency)} in · {formatCurrency(totalExpense, currency)} out</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selected.size > 0 && (
            <button onClick={() => setDeletingMany(true)} className="btn btn-danger btn-sm">
              <Trash2 size={13} /> Delete {selected.size}
            </button>
          )}
          <button onClick={() => exportTransactionsCSV(filtered, categories)} className="btn btn-secondary btn-sm">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={() => { setEditId(null); setModalOpen(true); }} className="btn btn-primary btn-sm">
            <Plus size={13} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search transactions..."
              className="form-control"
              style={{ paddingLeft: 32 }}
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`btn btn-secondary btn-sm ${activeFilterCount > 0 ? 'active' : ''}`}
            style={{ position: 'relative', borderColor: activeFilterCount > 0 ? 'var(--accent-primary)' : undefined }}
          >
            <Filter size={13} /> Filters
            {activeFilterCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--accent-primary)', color: 'white',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters({ search: '', type: 'all', categoryId: '', paymentMethod: 'all', dateFrom: '', dateTo: '' })}
              className="btn btn-ghost btn-sm"
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <select className="form-control" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select className="form-control" value={filters.categoryId} onChange={(e) => setFilter('categoryId', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="form-control" value={filters.paymentMethod} onChange={(e) => setFilter('paymentMethod', e.target.value)}>
              <option value="all">All Methods</option>
              {Object.entries(paymentMethodLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input type="date" className="form-control" value={filters.dateFrom} onChange={(e) => setFilter('dateFrom', e.target.value)} placeholder="From" />
            <input type="date" className="form-control" value={filters.dateTo} onChange={(e) => setFilter('dateTo', e.target.value)} placeholder="To" />
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selected.size === paginated.length && paginated.length > 0}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th onClick={() => toggleSort('date')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Date <SortIcon field="date" /></span>
                </th>
                <th onClick={() => toggleSort('description')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Description <SortIcon field="description" /></span>
                </th>
                <th onClick={() => toggleSort('category')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Category <SortIcon field="category" /></span>
                </th>
                <th>Method</th>
                <th onClick={() => toggleSort('amount')} style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'right' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>Amount <SortIcon field="amount" /></span>
                </th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: 13 }}>
                    No transactions found
                  </td>
                </tr>
              ) : (
                paginated.map((t) => {
                  const cat = catMap[t.categoryId];
                  return (
                    <tr key={t.id} style={{ background: selected.has(t.id) ? 'var(--accent-muted)' : undefined }}>
                      <td>
                        <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {formatDate(t.date, settings.dateFormat)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 7,
                            background: cat ? `${cat.color}20` : 'var(--bg-tertiary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {t.type === 'income'
                              ? <ArrowUpRight size={13} color="var(--green)" />
                              : <ArrowDownLeft size={13} color="var(--red)" />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{t.description}</div>
                            {t.notes && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{t.notes}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        {cat ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '2px 8px', borderRadius: 999,
                            background: `${cat.color}20`, color: cat.color,
                            fontSize: 11, fontWeight: 600,
                          }}>
                            {cat.name}
                          </span>
                        ) : <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>Unknown</span>}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {paymentMethodLabels[t.paymentMethod] || t.paymentMethod}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: t.type === 'income' ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => handleEdit(t.id)} className="btn btn-ghost btn-icon btn-sm" data-tooltip="Edit">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDuplicate(t)} className="btn btn-ghost btn-icon btn-sm" data-tooltip="Duplicate">
                            <Copy size={13} />
                          </button>
                          <button onClick={() => setDeleteId(t.id)} className="btn btn-ghost btn-icon btn-sm" data-tooltip="Delete" style={{ color: 'var(--red)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '12px 16px', borderTop: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary btn-sm">
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minWidth: 32 }}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-secondary btn-sm">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditId(null); }}
        editId={editId}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteTransaction(deleteId);
            toast.success('Transaction deleted');
            setDeleteId(null);
          }
        }}
        title="Delete Transaction"
        message="This will permanently delete this transaction. This action cannot be undone."
        confirmLabel="Delete"
        danger
      />

      <ConfirmDialog
        open={deletingMany}
        onClose={() => setDeletingMany(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} Transactions`}
        message={`This will permanently delete ${selected.size} selected transactions. This action cannot be undone.`}
        confirmLabel="Delete All"
        danger
      />
    </div>
  );
}
