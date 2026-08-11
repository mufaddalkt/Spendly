'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, ArrowRight, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
      toast.success('Password successfully reset!');
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
            Set new password
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Choose a strong password to protect your account.
          </p>
        </div>

        {completed ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: 'var(--green-muted)',
              color: 'var(--green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <CheckCircle2 size={24} />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Password updated!
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Your password has been reset successfully. You can now sign in with your new credentials.
            </p>

            <button onClick={() => router.push('/login')} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Sign in now <ArrowRight size={16} />
            </button>
          </div>
        ) : (
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
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
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

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat new password"
                  className="form-control"
                  style={{ paddingLeft: 36 }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        )}

        <div style={{
          marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-subtle)', paddingTop: 20,
        }}>
          Remember your password?{' '}
          <Link href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
