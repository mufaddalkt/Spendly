'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';

const PUBLIC_PATHS = ['/login', '/signup'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { activeUserId } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!activeUserId && !isPublic) {
      router.push('/login');
    } else if (activeUserId && isPublic) {
      router.push('/');
    }
  }, [activeUserId, pathname, mounted, router]);

  if (!mounted) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-secondary)', color: 'var(--text-tertiary)', fontSize: 13,
      }}>
        Loading Spendly...
      </div>
    );
  }

  const isPublic = PUBLIC_PATHS.includes(pathname);
  if (!activeUserId && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
