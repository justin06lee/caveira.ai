import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword, newId, normalizeEmail, signIn } from '@/lib/auth';
import { json, readJSON, sameOrigin } from '@/lib/http';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Cross-site request refused.' }, 403);
  const body = await readJSON<{ email: string; password: string }>(req);
  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email) return json({ error: 'That doesn’t look like an email address.' }, 400);
  if (password.length < 8) return json({ error: 'Use at least 8 characters for the password.' }, 400);
  if (password.length > 200) return json({ error: 'That password is too long.' }, 400);

  const [taken] = await db().select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (taken) return json({ error: 'There’s already an account with that email. Sign in instead.' }, 409);

  const id = newId('usr');
  await db().insert(users).values({ id, email, passwordHash: await hashPassword(password) });
  await signIn(id);
  return json({ ok: true });
}
