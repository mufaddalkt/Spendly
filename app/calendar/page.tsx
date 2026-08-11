'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatCurrency, getDailyTotals } from '@/lib/utils/finance';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Transaction } from '@/types';

function DynamicIcon({ name, size = 14, color }: { name: string; size?: number; color?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[name];
  return Icon ? <Icon size={size} color={color} /> : null;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { transactions, categories, settings } = useAppStore();
  const currency = settings.currency;
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const dailyTotals = useMemo(() =>
    getDailyTotals(transactions, viewDate.getFullYear(), viewDate.getMonth()),
    [transactions, viewDate]
  );

  const days = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const startPadding = getDay(startOfMonth(viewDate)); // 0=Sun
  const selectedDateTxns = useMemo((): Transaction[] => {
    if (!selectedDate) return [];
    return transactions.filter((t) => t.date === selectedDate).sort((a, b) => b.amount - a.amount);
  }, [transactions, selectedDate]);

  // Find max expense day for heatmap
  const maxExpense = Math.max(...Object.values(dailyTotals).map((d) => d.expenses), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Your financial activity day by day</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setViewDate((d) => subMonths(d, 1))} className="btn btn-secondary btn-sm"><ChevronLeft size={14} /></button>
          <span style={{ fontSize: 15, fontWeight: 700, minWidth: 140, textAlign: 'center' }}>
            {format(viewDate, 'MMMM yyyy')}
          </span>
          <button onClick={() => setViewDate((d) => addMonths(d, 1))} className="btn btn-secondary btn-sm"><ChevronRight size={14} /></button>
          <button onClick={() => setViewDate(new Date())} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>Today</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedDate ? '1fr 320px' : '1fr', gap: 16 }}>
        {/* Calendar Grid */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-default)' }}>
            {WEEKDAYS.map((d) => (
              <div key={d} style={{
                padding: '10px 0', textAlign: 'center',
                fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Padding cells */}
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} style={{ borderBottom: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)', minHeight: 80 }} />
            ))}

            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const data = dailyTotals[dateStr];
              const isSelected = selectedDate === dateStr;
              const todayDay = isToday(day);
              const expenseIntensity = data ? data.expenses / maxExpense : 0;
              const col = (startPadding + day.getDate() - 1) % 7;
              const hasTxns = !!data;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    borderRight: '1px solid var(--border-subtle)',
                    minHeight: 80, padding: '8px 6px',
                    cursor: hasTxns ? 'pointer' : 'default',
                    background: isSelected
                      ? 'var(--accent-muted)'
                      : hasTxns && expenseIntensity > 0.5
                        ? `rgba(239, 68, 68, ${expenseIntensity * 0.08})`
                        : 'transparent',
                    transition: 'background var(--transition)',
                  }}
                >
                  {/* Day number */}
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: todayDay ? 'var(--accent-primary)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: todayDay ? 700 : 400,
                    color: todayDay ? 'white' : 'var(--text-primary)',
                    marginBottom: 4,
                  }}>
                    {day.getDate()}
                  </div>

                  {/* Day data */}
                  {data && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {data.income > 0 && (
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--green)', lineHeight: 1.2 }}>
                          +{formatCurrency(data.income, currency)}
                        </div>
                      )}
                      {data.expenses > 0 && (
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--red)', lineHeight: 1.2 }}>
                          -{formatCurrency(data.expenses, currency)}
                        </div>
                      )}
                      {data.net !== 0 && (
                        <div style={{ fontSize: 9, color: data.net >= 0 ? 'var(--blue)' : 'var(--text-tertiary)', lineHeight: 1.2 }}>
                          net {data.net >= 0 ? '+' : ''}{formatCurrency(data.net, currency)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Detail Panel */}
        {selectedDate && (
          <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 20 }}>
            <div className="card-header">
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
              </h2>
              <button onClick={() => setSelectedDate(null)} className="btn btn-ghost btn-icon btn-sm"><X size={14} /></button>
            </div>
            <div className="card-body" style={{ paddingTop: 8 }}>
              {selectedDateTxns.length === 0 ? (
                <p style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', padding: 20 }}>No transactions on this day</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {selectedDateTxns.map((t) => {
                    const cat = catMap[t.categoryId];
                    return (
                      <div key={t.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
                      }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: cat ? `${cat.color}20` : 'var(--bg-tertiary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <DynamicIcon name={cat?.icon || 'MoreHorizontal'} size={13} color={cat?.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{cat?.name}</div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: t.type === 'income' ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                        </span>
                      </div>
                    );
                  })}

                  {/* Day summary */}
                  {dailyTotals[selectedDate] && (
                    <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {dailyTotals[selectedDate].income > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Total Income</span>
                          <span style={{ fontWeight: 600, color: 'var(--green)' }}>+{formatCurrency(dailyTotals[selectedDate].income, currency)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Expenses</span>
                        <span style={{ fontWeight: 600, color: 'var(--red)' }}>-{formatCurrency(dailyTotals[selectedDate].expenses, currency)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingTop: 6, borderTop: '1px solid var(--border-subtle)', fontWeight: 700 }}>
                        <span>Net</span>
                        <span style={{ color: dailyTotals[selectedDate].net >= 0 ? 'var(--green)' : 'var(--red)' }}>
                          {dailyTotals[selectedDate].net >= 0 ? '+' : ''}{formatCurrency(dailyTotals[selectedDate].net, currency)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
