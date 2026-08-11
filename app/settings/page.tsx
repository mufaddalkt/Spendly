'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { exportTransactionsCSV } from '@/lib/utils/finance';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import {
  User, Settings2, Sun, Moon, Monitor, Bell, Database,
  Tag, Plus, Edit2, Trash2, Download, Upload, RotateCcw, Save
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Category, Currency, DateFormat, WeekStart, ThemeMode } from '@/types';

const CATEGORY_COLORS = ['#f97316', '#8b5cf6', '#3b82f6', '#ef4444', '#ec4899', '#10b981', '#06b6d4', '#f59e0b', '#6366f1', '#6b7280'];
const CATEGORY_ICONS = ['UtensilsCrossed', 'ShoppingBag', 'Car', 'Receipt', 'Tv', 'Heart', 'BookOpen', 'Plane', 'RefreshCw', 'MoreHorizontal', 'Briefcase', 'Laptop', 'Building2', 'TrendingUp', 'Gift', 'PlusCircle'];

function DynamicIcon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[name];
  return Icon ? <Icon size={size} color={color} /> : null;
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ size?: number }>; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} />
          </div>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h2>
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

export default function SettingsPage() {
  const {
    profile, settings, categories,
    updateProfile, updateSettings,
    addCategory, updateCategory, deleteCategory,
    transactions, resetToDemo,
  } = useAppStore();

  const [profileForm, setProfileForm] = useState({ ...profile });
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [catForm, setCatForm] = useState({
    name: '', type: 'expense' as 'expense' | 'income' | 'both',
    icon: 'Tag', color: '#6366f1', isCustom: true,
  });

  function saveProfile() {
    updateProfile(profileForm);
    toast.success('Profile saved');
  }

  function openAddCat() {
    setEditCatId(null);
    setCatForm({ name: '', type: 'expense', icon: 'Tag', color: '#6366f1', isCustom: true });
    setCatModalOpen(true);
  }

  function openEditCat(c: Category) {
    setEditCatId(c.id);
    setCatForm({ name: c.name, type: c.type as 'expense' | 'income' | 'both', icon: c.icon, color: c.color, isCustom: true });
    setCatModalOpen(true);
  }

  function saveCat() {
    if (!catForm.name.trim()) { toast.error('Name is required'); return; }
    if (editCatId) {
      updateCategory(editCatId, catForm);
      toast.success('Category updated');
    } else {
      addCategory(catForm);
      toast.success('Category created');
    }
    setCatModalOpen(false);
  }

  const themeOptions: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', Icon: Sun },
    { value: 'dark', label: 'Dark', Icon: Moon },
    { value: 'system', label: 'System', Icon: Monitor },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 700 }}>
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {profileForm.name.charAt(0)}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" value={profileForm.name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={profileForm.email}
                    onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={saveProfile} className="btn btn-primary btn-sm">
                  <Save size={13} /> Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Preferences */}
      <Section title="Preferences" icon={Settings2}>
        <Row label="Currency">
          <select className="form-control" style={{ width: 'auto', maxWidth: 260 }} value={settings.currency}
            onChange={(e) => updateSettings({ currency: e.target.value as Currency })}>
            <option value="USD">USD – US Dollar ($)</option>
            <option value="EUR">EUR – Euro (€)</option>
            <option value="GBP">GBP – British Pound (£)</option>
            <option value="JPY">JPY – Japanese Yen (¥)</option>
            <option value="CAD">CAD – Canadian Dollar (CA$)</option>
            <option value="AUD">AUD – Australian Dollar (A$)</option>
            <option value="CHF">CHF – Swiss Franc (CHF)</option>
            <option value="INR">INR – Indian Rupee (₹)</option>
            <option value="CNY">CNY – Chinese Yuan (¥)</option>
            <option value="BRL">BRL – Brazilian Real (R$)</option>
            <option value="MXN">MXN – Mexican Peso ($)</option>
            <option value="KRW">KRW – South Korean Won (₩)</option>
            <option value="RUB">RUB – Russian Ruble (₽)</option>
            <option value="ZAR">ZAR – South African Rand (R)</option>
            <option value="SGD">SGD – Singapore Dollar (S$)</option>
            <option value="HKD">HKD – Hong Kong Dollar (HK$)</option>
            <option value="NZD">NZD – New Zealand Dollar (NZ$)</option>
            <option value="SEK">SEK – Swedish Krona (kr)</option>
            <option value="NOK">NOK – Norwegian Krone (kr)</option>
            <option value="DKK">DKK – Danish Krone (kr)</option>
            <option value="PLN">PLN – Polish Zloty (zł)</option>
            <option value="TRY">TRY – Turkish Lira (₺)</option>
            <option value="AED">AED – UAE Dirham (AED)</option>
            <option value="SAR">SAR – Saudi Riyal (SAR)</option>
            <option value="EGP">EGP – Egyptian Pound (EGP)</option>
            <option value="THB">THB – Thai Baht (฿)</option>
            <option value="IDR">IDR – Indonesian Rupiah (Rp)</option>
            <option value="MYR">MYR – Malaysian Ringgit (RM)</option>
            <option value="PHP">PHP – Philippine Peso (₱)</option>
            <option value="VND">VND – Vietnamese Dong (₫)</option>
            <option value="PKR">PKR – Pakistani Rupee (Rs)</option>
            <option value="BDT">BDT – Bangladeshi Taka (৳)</option>
            <option value="ILS">ILS – Israeli New Shekel (₪)</option>
            <option value="NGN">NGN – Nigerian Naira (₦)</option>
            <option value="KES">KES – Kenyan Shilling (KSh)</option>
            <option value="COP">COP – Colombian Peso ($)</option>
            <option value="ARS">ARS – Argentine Peso ($)</option>
            <option value="CLP">CLP – Chilean Peso ($)</option>
            <option value="PEN">PEN – Peruvian Sol (S/.)</option>
            <option value="UAH">UAH – Ukrainian Hryvnia (₴)</option>
          </select>
        </Row>
        <Row label="Date Format">
          <select className="form-control" style={{ width: 'auto' }} value={settings.dateFormat}
            onChange={(e) => updateSettings({ dateFormat: e.target.value as DateFormat })}>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </Row>
        <Row label="Week Starts On">
          <select className="form-control" style={{ width: 'auto' }} value={settings.weekStart}
            onChange={(e) => updateSettings({ weekStart: e.target.value as WeekStart })}>
            <option value="sunday">Sunday</option>
            <option value="monday">Monday</option>
          </select>
        </Row>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={Sun}>
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          {themeOptions.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => updateSettings({ theme: value })}
              style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                border: `2px solid ${settings.theme === value ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                background: settings.theme === value ? 'var(--accent-muted)' : 'var(--bg-secondary)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6, transition: 'all var(--transition)',
                color: settings.theme === value ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <Row label="Budget warnings">
          <Toggle checked={settings.notifications.budgetWarnings}
            onChange={(v) => updateSettings({ notifications: { ...settings.notifications, budgetWarnings: v } })} />
        </Row>
        <Row label="Upcoming payment reminders">
          <Toggle checked={settings.notifications.upcomingPayments}
            onChange={(v) => updateSettings({ notifications: { ...settings.notifications, upcomingPayments: v } })} />
        </Row>
        <Row label="Monthly summaries">
          <Toggle checked={settings.notifications.monthlySummaries}
            onChange={(v) => updateSettings({ notifications: { ...settings.notifications, monthlySummaries: v } })} />
        </Row>
      </Section>

      {/* Categories */}
      <Section title="Categories" icon={Tag}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {categories.map((c) => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 0', borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: `${c.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <DynamicIcon name={c.icon} size={13} color={c.color} />
              </div>
              <span style={{ flex: 1, fontSize: 13 }}>{c.name}</span>
              <span className={`badge ${c.type === 'income' ? 'badge-income' : c.type === 'expense' ? 'badge-expense' : 'badge-neutral'}`}>
                {c.type}
              </span>
              {c.isCustom ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEditCat(c)} className="btn btn-ghost btn-icon btn-sm"><Edit2 size={12} /></button>
                  <button onClick={() => setDeleteCatId(c.id)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--red)' }}><Trash2 size={12} /></button>
                </div>
              ) : (
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)', padding: '2px 6px' }}>default</span>
              )}
            </div>
          ))}
          <button onClick={openAddCat} className="btn btn-secondary btn-sm" style={{ marginTop: 12, alignSelf: 'flex-start' }}>
            <Plus size={13} /> Add Category
          </button>
        </div>
      </Section>

      {/* Data Management */}
      <Section title="Data Management" icon={Database}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Export Transactions</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{transactions.length} transactions as CSV</div>
            </div>
            <button onClick={() => { exportTransactionsCSV(transactions, categories); toast.success('Export started'); }} className="btn btn-secondary btn-sm">
              <Download size={13} /> Export CSV
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Reset to Demo Data</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Restore all demo transactions, budgets, and goals</div>
            </div>
            <button onClick={() => setResetConfirm(true)} className="btn btn-danger btn-sm">
              <RotateCcw size={13} /> Reset Data
            </button>
          </div>
        </div>
      </Section>

      {/* Category Modal */}
      <Modal open={catModalOpen} onClose={() => setCatModalOpen(false)} title={editCatId ? 'Edit Category' : 'Add Category'} size="sm"
        footer={
          <>
            <button onClick={() => setCatModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={saveCat} className="btn btn-primary">Save</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-control" value={catForm.name} onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-control" value={catForm.type} onChange={(e) => setCatForm((f) => ({ ...f, type: e.target.value as 'expense' | 'income' | 'both' }))}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORY_COLORS.map((c) => (
                <div key={c} className={`color-swatch ${catForm.color === c ? 'selected' : ''}`}
                  style={{ background: c }} onClick={() => setCatForm((f) => ({ ...f, color: c }))} />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORY_ICONS.map((icon) => (
                <div key={icon} onClick={() => setCatForm((f) => ({ ...f, icon }))}
                  style={{
                    width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: catForm.icon === icon ? 'var(--accent-muted)' : 'var(--bg-tertiary)',
                    border: `2px solid ${catForm.icon === icon ? 'var(--accent-primary)' : 'transparent'}`,
                    transition: 'all var(--transition)',
                  }}>
                  <DynamicIcon name={icon} size={15} color={catForm.icon === icon ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={() => { if (deleteCatId) { deleteCategory(deleteCatId); toast.success('Category deleted'); setDeleteCatId(null); } }}
        title="Delete Category"
        message="This will delete this category. Transactions with this category will show as unknown."
        confirmLabel="Delete"
        danger
      />

      <ConfirmDialog
        open={resetConfirm}
        onClose={() => setResetConfirm(false)}
        onConfirm={() => { resetToDemo(); toast.success('Demo data restored'); setResetConfirm(false); }}
        title="Reset to Demo Data"
        message="This will replace all your data with the demo dataset. This cannot be undone."
        confirmLabel="Reset Data"
        danger
      />
    </div>
  );
}
