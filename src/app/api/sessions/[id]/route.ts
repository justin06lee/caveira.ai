import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { sessions } from '@/db/schema';
import { currentViewer } from '@/lib/auth';
import { json, sameOrigin } from '@/lib/http';

// Disconnects one of the account's devices.
export async function DELETE(req: Request, ctx: RouteContext<'/api/sessions/[id]'>) {
  if (!sameOrigin(req)) return json({ error: 'Cross-site request refused.' }, 403);
  const viewer = await currentViewer();
  if (!viewer) return json({ error: 'Sign in first.' }, 401);
  const { id } = await ctx.params;
  await db()
    .delete(sessions)
    .where(and(eq(sessions.id, id), eq(sessions.userId, viewer.user.id)));
  return json({ ok: true });
}
