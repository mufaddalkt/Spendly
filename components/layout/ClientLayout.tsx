'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { ThemeProvider } from './ThemeProvider';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { AuthGuard } from './AuthGuard';
import { GlobalSearch } from '@/components/ui/GlobalSearch';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { Plus } from 'lucide-react';

const PUBLIC_PATHS = ['/login', '/signup'];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [txnModalOpen, setTxnModalOpen] = useState(false);

  // Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <ThemeProvider>
      <AuthGuard>
        {isPublic ? (
          <div>
            {children}
            <Toaster position="bottom-right" />
          </div>
        ) : (
          <div className="app-layout">
            {/* Desktop Sidebar */}
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
              <div
                style={{
                  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                  zIndex: 49, display: 'none',
                }}
                onClick={() => setMobileOpen(false)}
                className="mobile-overlay"
              />
            )}

            {/* Main */}
            <main className={`app-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
              <Header
                onSearch={() => setSearchOpen(true)}
                onAddTransaction={() => setTxnModalOpen(true)}
              />
              <div className="app-content animate-fade-in">
                {children}
              </div>
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNav />

            {/* Mobile Floating Action Button */}
            <button
              onClick={() => setTxnModalOpen(true)}
              style={{
                position: 'fixed',
                bottom: 74,
                right: 16,
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                boxShadow: 'var(--shadow-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 49,
                cursor: 'pointer',
              }}
              className="show-mobile"
              aria-label="Add transaction"
            >
              <Plus size={22} />
            </button>

            {/* Global Search */}
            <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

            {/* Add Transaction Modal */}
            <TransactionModal open={txnModalOpen} onClose={() => setTxnModalOpen(false)} />

            {/* Toast Notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                },
              }}
            />
          </div>
        )}
      </AuthGuard>

      <style>{`
        @media (max-width: 768px) {
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </ThemeProvider>
  );
}
