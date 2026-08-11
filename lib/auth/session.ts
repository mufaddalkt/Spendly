import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'spendly_session';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}

// Simple base64 token generator for demonstration session security
export function createSessionToken(payload: SessionPayload): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return Buffer.from(data).toString('base64');
}

export function decodeSessionToken(token: string): SessionPayload | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const data = JSON.parse(raw);
    if (data.exp && data.exp < Date.now()) return null;
    return { userId: data.userId, email: data.email, name: data.name };
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSessionToken(token);
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function hashPassword(password: string): string {
  // Simple deterministic hash representation for zero-dependency local execution
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hashed_${Math.abs(hash).toString(16)}_${password.length}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
