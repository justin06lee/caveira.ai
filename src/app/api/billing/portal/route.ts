import { currentViewer } from '@/lib/auth';
import { appUrl, json, sameOrigin } from '@/lib/http';
import { devBilling, portal } from '@/lib/stripe';

// Stripe's billing portal: cards, invoices, cancelling.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Cross-site request refused.' }, 403);
  const viewer = await currentViewer();
  if (!viewer) return json({ error: 'Sign in first.' }, 401);
  if (devBilling()) return json({ error: 'Billing runs without Stripe in development.' }, 400);
  try {
    return json({ url: await portal(viewer.user, appUrl(req)) });
  } catch (e) {
    console.error('portal', e);
    return json({ error: 'Billing isn’t reachable right now. Try again in a minute.' }, 502);
  }
}
