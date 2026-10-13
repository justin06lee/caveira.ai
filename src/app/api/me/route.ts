import { planOf, requestViewer } from '@/lib/auth';
import { apiError, json } from '@/lib/http';
import { summary } from '@/lib/usage';

// Who the caller is signed in as, the plan, and how much of this month's
// usage is gone. The desktop app gates its chats on this.
export async function GET(req: Request) {
  const viewer = await requestViewer(req);
  if (!viewer) return apiError(401, 'unauthorized', 'Not signed in.');
  const plan = planOf(viewer.subscription);
  return json({
    email: viewer.user.email,
    plan: {
      id: plan.id,
      name: plan.name,
      large: plan.large,
      status: plan.price > 0 ? (viewer.subscription?.status ?? '') : '',
      cancel_at_period_end: Boolean(viewer.subscription?.cancelAtPeriodEnd && plan.price > 0),
    },
    usage: await summary(viewer.user.id, plan),
  });
}
