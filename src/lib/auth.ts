import { createHash, randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { and, eq, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { db } from '@/db';
import { sessions, subscriptions, users, type Session, type Subscription, type User } from '@/db/schema';

import { FREE, planById, type Plan } from './plans';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const SESSION_COOKIE = 'caveira_session';
const DAY = 86_400;
const LIFETIME = { web: 30 * DAY, tui: 365 * DAY, desktop: 365 * DAY } as const;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const want = Buffer.from(hash, 'hex');
  const got = await scrypt(password, Buffer.from(salt, 'hex'), want.length);
  return timingSafeEqual(want, got);
}

// A password for an address that has no account, so a wrong email takes as
// long as a wrong password and the two can't be told apart.
let decoy: Promise<string> | undefined;
export function decoyHash(): Promise<string> {
  decoy ??= hashPassword(randomBytes(16).toString('hex'));
  return decoy;
}

export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString('hex')}`;
}

export function newToken(prefix: string): string {
  return `${prefix}_${randomBytes(32).toString('base64url')}`;
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// No I, O, 0 or 1: the code is read off one screen and checked on another.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newUserCode(): string {
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

export function unix(): number {
  return Math.floor(Date.now() / 1000);
}

export async function createSession(userId: string, kind: Session['kind'], label?: string | null) {
  const token = newToken(kind === 'web' ? 'cvs' : 'cav');
  const expiresAt = unix() + LIFETIME[kind];
  await db()
    .insert(sessions)
    .values({ id: newId('ses'), tokenHash: hashToken(token), userId, kind, label: label?.slice(0, 80) || null, expiresAt });
  return { token, expiresAt };
}

export type Viewer = { user: User; session: Session; subscription: Subscription | null };

export async function viewerFromToken(token: string | undefined | null): Promise<Viewer | null> {
  if (!token) return null;
  const now = unix();
  const [row] = await db()
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, now)))
    .limit(1);
  if (!row) return null;
  // Last used is for the devices list; an hour is fine enough for that.
  if (now - row.session.lastUsedAt > 3600) {
    await db().update(sessions).set({ lastUsedAt: now }).where(eq(sessions.id, row.session.id));
  }
  const [subscription] = await db().select().from(subscriptions).where(eq(subscriptions.userId, row.user.id)).limit(1);
  return { ...row, subscription: subscription ?? null };
}

// The visitor of a page, from the session cookie.
export async function currentViewer(): Promise<Viewer | null> {
  return viewerFromToken((await cookies()).get(SESSION_COOKIE)?.value);
}

// The caller of an API route: a client's bearer token or the browser's
// cookie, so both go through the same checks.
export async function requestViewer(req: Request): Promise<Viewer | null> {
  const bearer = req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  return viewerFromToken(bearer ?? (await cookies()).get(SESSION_COOKIE)?.value);
}

export async function signIn(userId: string): Promise<void> {
  const { token } = await createSession(userId, 'web');
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: LIFETIME.web,
  });
}

// What Stripe says counts as paid up. Past due still counts: Stripe retries
// a failed card for days, and that shouldn't lock anyone out meanwhile.
const PAID = new Set(['active', 'trialing', 'past_due']);

export function planOf(subscription: Subscription | null): Plan {
  if (subscription && PAID.has(subscription.status)) return planById(subscription.planId) ?? FREE;
  return FREE;
}

export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const e = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254 ? e : null;
}
