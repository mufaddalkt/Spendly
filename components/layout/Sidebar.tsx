'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, BarChart3, RefreshCw,
  Target, Calendar, Settings, ChevronLeft, ChevronRight,
  Sun, Moon, Monitor, Wallet
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ThemeMode } from '@/types';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: PieChart },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/recurring', label: 'Recurring', icon: RefreshCw },
  { href: '/goals', label: 'Savings Goals', icon: Target },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { profile, settings, updateSettings } = useAppStore();

  const ThemeIcon = themeIcons[settings.theme];

  function cycleTheme() {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const idx = order.indexOf(settings.theme);
    updateSettings({ theme: order[(idx + 1) % 3] });
  }

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid var(--border-default)',
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: 'var(--header-height)',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--accent-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Wallet size={18} color="white" />
        </div>
        {!collapsed && (
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Spendly
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item ${active ? 'active' : ''}`}
              style={{ justifyContent: collapsed ? 'center' : undefined }}
              data-tooltip={collapsed ? label : undefined}
            >
              <Icon size={18} className="nav-item-icon" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div style={{ borderTop: '1px solid var(--border-default)', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          className="nav-item"
          style={{ justifyContent: collapsed ? 'center' : undefined, width: '100%' }}
          data-tooltip={collapsed ? `Theme: ${settings.theme}` : undefined}
        >
          <ThemeIcon size={18} className="nav-item-icon" />
          {!collapsed && <span style={{ textTransform: 'capitalize' }}>{settings.theme} Mode</span>}
        </button>

        {/* User Profile */}
        {!collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              fontSize: 13, fontWeight: 600, color: 'white',
            }}>
              {profile.name.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.email}
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{
            display: 'flex', justifyContent: 'center',
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--accent-primary)',
            alignItems: 'center', justifySelf: 'center',
            fontSize: 13, fontWeight: 600, color: 'white',
            margin: '0 auto',
          }}>
            {profile.name.charAt(0)}
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="btn btn-ghost btn-icon"
          style={{ alignSelf: collapsed ? 'center' : 'flex-end', marginTop: 4 }}
          data-tooltip={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
