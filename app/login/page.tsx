'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { Wallet, ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAppStore();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = signIn(email, password);
      setLoading(false);

      if (!res.success) {
        setError(res.error || 'Failed to sign in.');
      } else {
        toast.success('Welcome back to Spendly!');
        router.push('/');
      }
    }, 300);
  }

  function handleDemoLogin() {
    setEmail('alex@example.com');
    setPassword('password123');
    setLoading(true);

    setTimeout(() => {
      const res = signIn('alex@example.com', 'password123');
      setLoading(false);
      if (res.success) {
        toast.success('Signed in with Demo Account!');
        router.push('/');
      }
    }, 300);
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
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--accent-primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, boxShadow: '0 8px 16px rgba(99, 102, 241, 0.25)',
          }}>
            <Wallet size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Sign in to manage your finances with Spendly
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{
              background: 'var(--red-muted)', color: 'var(--red)',
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              fontSize: 13, fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email address</label>
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

          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <Link href="/forgot-password" style={{ fontSize: 11, color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="form-control"
                style={{ paddingLeft: 36, paddingRight: 36 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-subtle)', paddingTop: 20,
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
