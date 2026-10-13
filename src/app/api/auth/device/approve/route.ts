import { and, eq, gt } from 'drizzle-orm';

import { db } from '@/db';
import { deviceLogins } from '@/db/schema';
import { currentViewer, unix } from '@/lib/auth';
import { json, readJSON, sameOrigin } from '@/lib/http';

// The signed-in browser connects a client's login to this account, or turns
// it away.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Cross-site request refused.' }, 403);
  const viewer = await currentViewer();
  if (!viewer) return json({ error: 'Sign in first.' }, 401);

  const body = await readJSON<{ user_code: string; approve: boolean }>(req);
  const code = typeof body?.user_code === 'string' ? body.user_code.trim().toUpperCase() : '';
  const [login] = await db()
    .select()
    .from(deviceLogins)
    .where(and(eq(deviceLogins.userCode, code), eq(deviceLogins.status, 'pending'), gt(deviceLogins.expiresAt, unix())))
    .limit(1);
  if (!login) return json({ error: 'That code has expired or was already used. Start the login again.' }, 404);

  await db()
    .update(deviceLogins)
    .set(body?.approve ? { status: 'approved', userId: viewer.user.id } : { status: 'denied' })
    .where(eq(deviceLogins.id, login.id));
  return json({ ok: true });
}
