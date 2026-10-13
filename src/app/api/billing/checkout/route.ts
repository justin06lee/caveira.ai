import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { currentViewer, planOf } from '@/lib/auth';
import { appUrl, json, readJSON, sameOrigin } from '@/lib/http';
import { planById } from '@/lib/plans';
import { changePlan, checkout, devBilling } from '@/lib/stripe';

// Puts the signed-in account on a plan: Stripe Checkout for a first
// subscription, Stripe's confirm page to switch or cancel a running one.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Cross-site request refused.' }, 403);
  const viewer = await currentViewer();
  if (!viewer) return json({ error: 'Sign in first.' }, 401);
  const body = await readJSON<{ plan: string }>(req);
  const plan = planById(body?.plan);
  if (!plan) return json({ error: 'There is no such plan.' }, 400);

  const origin = appUrl(req);
  const current = planOf(viewer.subscription);
  if (current.id === plan.id) return json({ url: `${origin}/account` });

  if (devBilling()) {
    const row = { stripeSubscriptionId: 'dev', planId: plan.id, status: 'active', updatedAt: Math.floor(Date.now() / 1000) };
    await db()
      .insert(subscriptions)
      .values({ userId: viewer.user.id, ...row })
      .onConflictDoUpdate({ target: subscriptions.userId, set: row });
    return json({ url: `${origin}/account?changed=1` });
  }

  try {
    const sub = viewer.subscription;
    if (current.price > 0 && sub?.stripeItemId) {
      return json({ url: await changePlan(viewer.user, sub.stripeSubscriptionId, sub.stripeItemId, plan, origin) });
    }
    if (plan.price === 0) return json({ url: `${origin}/account` });
    return json({ url: await checkout(viewer.user, plan, origin) });
  } catch (e) {
    console.error('checkout', e);
    return json({ error: 'Payments aren’t working right now. Try again in a minute.' }, 502);
  }
}
