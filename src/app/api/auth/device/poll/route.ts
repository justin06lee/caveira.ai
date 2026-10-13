import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { deviceLogins, users } from '@/db/schema';
import { createSession, hashToken, unix } from '@/lib/auth';
import { json, readJSON } from '@/lib/http';

const oauth = (error: string) => json({ error }, 400);

// The client asks whether its login was connected yet; once it was, it gets
// its token, once.
export async function POST(req: Request) {
  const body = await readJSON<{ device_code: string }>(req);
  if (typeof body?.device_code !== 'string') return oauth('invalid_request');

  const [login] = await db()
    .select()
    .from(deviceLogins)
    .where(eq(deviceLogins.deviceCodeHash, hashToken(body.device_code)))
    .limit(1);
  if (!login || login.expiresAt <= unix()) return oauth('expired_token');
  if (login.status === 'denied') {
    await db().delete(deviceLogins).where(eq(deviceLogins.id, login.id));
    return oauth('access_denied');
  }
  if (login.status !== 'approved' || !login.userId) return oauth('authorization_pending');

  // Taking the row is what hands the token out, so two polls racing get
  // one token between them.
  const taken = await db().delete(deviceLogins).where(eq(deviceLogins.id, login.id)).returning({ id: deviceLogins.id });
  if (!taken.length) return oauth('expired_token');

  const [user] = await db().select({ email: users.email }).from(users).where(eq(users.id, login.userId)).limit(1);
  if (!user) return oauth('access_denied');
  const { token } = await createSession(login.userId, login.client, login.label);
  return json({ token, email: user.email });
}
