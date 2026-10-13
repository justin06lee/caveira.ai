import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';
import { decoyHash, normalizeEmail, signIn, verifyPassword } from '@/lib/auth';
import { json, readJSON, sameOrigin } from '@/lib/http';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Cross-site request refused.' }, 403);
  const body = await readJSON<{ email: string; password: string }>(req);
  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === 'string' ? body.password : '';

  const [user] = email ? await db().select().from(users).where(eq(users.email, email)).limit(1) : [];
  // Check a password either way, so a missing account answers as slowly as a
  // wrong password.
  const ok = await verifyPassword(password, user?.passwordHash ?? (await decoyHash()));
  if (!user || !ok) return json({ error: 'That email and password don’t match.' }, 401);

  await signIn(user.id);
  return json({ ok: true });
}
