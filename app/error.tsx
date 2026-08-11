'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, textWrap: 'balance',
    }}>
      <div className="card" style={{ maxWidth: 480, width: '100%', padding: 36, textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'var(--red-muted)',
          color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <AlertTriangle size={28} />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
          {error.message || 'An unexpected error occurred while loading this page.'}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => reset()} className="btn btn-primary btn-sm">
            <RefreshCw size={14} /> Try Again
          </button>
          <Link href="/" className="btn btn-secondary btn-sm">
            <Home size={14} /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
