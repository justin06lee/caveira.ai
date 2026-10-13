import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { db } from '@/db';
import { sessions } from '@/db/schema';
import { hashToken, SESSION_COOKIE } from '@/lib/auth';
import { json, sameOrigin } from '@/lib/http';

// Ends the session that calls it: a client's bearer token, or the browser's
// cookie.
export async function POST(req: Request) {
  const bearer = req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (bearer) {
    await db().delete(sessions).where(eq(sessions.tokenHash, hashToken(bearer)));
    return json({ ok: true });
  }
  if (!sameOrigin(req)) return json({ error: 'Cross-site request refused.' }, 403);
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db().delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  jar.delete(SESSION_COOKIE);
  return json({ ok: true });
}
