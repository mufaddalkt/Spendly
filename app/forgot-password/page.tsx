'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wallet, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Password reset instructions sent!');
    }, 400);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-secondary)',
      padding: 24,
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: 420,
        padding: 32,
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--accent-primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, boxShadow: '0 8px 16px rgba(99, 102, 241, 0.25)',
          }}>
            <Wallet size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Reset Password
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: 'var(--green-muted)',
              color: 'var(--green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <CheckCircle2 size={24} />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
              We&apos;ve sent a password reset link to <strong>{email}</strong>. Follow the link to set a new password.
            </p>

            <Link href="/reset-password?token=demo-reset-token-123" className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }}>
              Simulate Clicking Email Link
            </Link>

            <div>
              <button onClick={() => setSubmitted(false)} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                Didn&apos;t receive email? Try again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                }} />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="form-control"
                  style={{ paddingLeft: 36 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? 'Sending link...' : 'Send reset link'}
            </button>
          </form>
        )}

        <div style={{
          marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-subtle)', paddingTop: 20,
        }}>
          <Link href="/login" style={{ color: 'var(--text-secondary)', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
