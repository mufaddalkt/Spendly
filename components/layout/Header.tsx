'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Plus, CheckCheck, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  onSearch: () => void;
  onAddTransaction: () => void;
}

export function Header({ onSearch, onAddTransaction }: HeaderProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, profile, signOut } = useAppStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const unread = notifications.filter((n) => !n.isRead).length;

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notif-panel]') && !target.closest('[data-notif-btn]')) {
        setShowNotifs(false);
      }
      if (!target.closest('[data-user-panel]') && !target.closest('[data-user-btn]')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const notifTypeColor: Record<string, string> = {
    budget_warning: 'var(--yellow)',
    budget_exceeded: 'var(--red)',
    upcoming_payment: 'var(--blue)',
    goal_milestone: 'var(--green)',
    monthly_summary: 'var(--accent-primary)',
    info: 'var(--text-secondary)',
  };

  function handleSignOut() {
    signOut();
    router.push('/login');
  }

  return (
    <header className="app-header">
      {/* Search Trigger */}
      <button
        onClick={onSearch}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 14px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-tertiary)',
          cursor: 'pointer',
          fontSize: 13,
          maxWidth: 380,
          transition: 'all var(--transition)',
        }}
        className="search-trigger"
      >
        <Search size={14} />
        <span>Search transactions, budgets...</span>
        <span style={{
          marginLeft: 'auto', padding: '1px 6px',
          background: 'var(--bg-tertiary)', borderRadius: 4,
          fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)',
        }}>
          ⌘K
        </span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
        {/* Add Transaction Button */}
        <button onClick={onAddTransaction} className="btn btn-primary btn-sm">
          <Plus size={14} />
          <span className="hide-mobile">Add Transaction</span>
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            data-notif-btn
            onClick={() => setShowNotifs((v) => !v)}
            className="btn btn-ghost btn-icon"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 16, height: 16,
                background: 'var(--red)',
                color: 'white',
                borderRadius: '50%',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-card)',
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              data-notif-panel
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                width: 340,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 200,
                overflow: 'hidden',
                animation: 'modalIn 150ms ease',
              }}
            >
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Notifications</span>
                {unread > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: 4, fontSize: 12 }}
                  >
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        background: n.isRead ? 'transparent' : 'var(--accent-muted)',
                        transition: 'background var(--transition)',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: notifTypeColor[n.type] || 'var(--text-tertiary)',
                        flexShrink: 0, marginTop: 5,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                          {format(new Date(n.createdAt), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            data-user-btn
            onClick={() => setShowUserMenu((v) => !v)}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--accent-primary)', color: 'white',
              border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </button>

          {showUserMenu && (
            <div
              data-user-panel
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                width: 220,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 200,
                overflow: 'hidden',
                padding: '6px 0',
                animation: 'modalIn 150ms ease',
              }}
            >
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                  {profile.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile.email}
                </div>
              </div>

              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)',
                  textDecoration: 'none', transition: 'background var(--transition)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <Settings size={15} />
                <span>Account Settings</span>
              </Link>

              <button
                onClick={handleSignOut}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', fontSize: 13, color: 'var(--red)',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderTop: '1px solid var(--border-subtle)', marginTop: 4,
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--red-muted)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={15} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .hide-mobile { display: none; }
          .search-trigger { max-width: 160px; }
        }
      `}</style>
    </header>
  );
}
