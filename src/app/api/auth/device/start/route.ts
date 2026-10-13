import { lt } from 'drizzle-orm';

import { db } from '@/db';
import { deviceLogins } from '@/db/schema';
import { hashToken, newId, newToken, newUserCode, unix } from '@/lib/auth';
import { appUrl, json, readJSON } from '@/lib/http';

const TTL = 10 * 60;
const INTERVAL = 2;

// A terminal or desktop client starts a login: it gets a secret device code
// to poll with, and a short code for the person to check in the browser.
export async function POST(req: Request) {
  const body = await readJSON<{ client: string; label: string }>(req);
  const client = body?.client === 'desktop' ? 'desktop' : 'tui';
  const label = typeof body?.label === 'string' ? body.label.slice(0, 80) : null;

  const deviceCode = newToken('dvc');
  const userCode = newUserCode();
  const now = unix();
  await db().delete(deviceLogins).where(lt(deviceLogins.expiresAt, now - 3600));
  await db()
    .insert(deviceLogins)
    .values({ id: newId('dev'), deviceCodeHash: hashToken(deviceCode), userCode, client, label, expiresAt: now + TTL });

  const base = appUrl(req);
  return json({
    device_code: deviceCode,
    user_code: userCode,
    verification_uri: `${base}/device`,
    verification_uri_complete: `${base}/device?code=${userCode}`,
    expires_in: TTL,
    interval: INTERVAL,
  });
}
