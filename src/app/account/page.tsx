import { and, desc, eq, inArray } from 'drizzle-orm';
import { Laptop, SquareTerminal } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { Disconnect, ManageBilling, SignOut } from '@/components/AccountActions';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { currentViewer, planOf, type Viewer } from '@/lib/auth';
import { stripe, sync } from '@/lib/stripe';
import { resetDay, summary } from '@/lib/usage';

export const metadata: Metadata = { title: 'Account' };

export default async function Account({ searchParams }: PageProps<'/account'>) {
  const params = await searchParams;
  let viewer = await currentViewer();
  if (!viewer) redirect('/login?next=/account');

  // Back from Stripe Checkout: write the subscription now rather than wait
  // for the webhook, so the page already shows the new plan.
  const sessionId = typeof params.session_id === 'string' ? params.session_id : null;
  if (sessionId && viewer.user.stripeCustomerId) {
    try {
      const s = await stripe().checkout.sessions.retrieve(sessionId);
      if (s.customer === viewer.user.stripeCustomerId) await sync(viewer.user.stripeCustomerId);
      viewer = (await currentViewer())!;
    } catch (e) {
      console.error('checkout return', e);
    }
  }

  const plan = planOf(viewer.subscription);
  const usage = await summary(viewer.user.id, plan);
  const devices = await db()
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, viewer.user.id), inArray(sessions.kind, ['tui', 'desktop'])))
    .orderBy(desc(sessions.lastUsedAt));
  const welcome = sessionId || params.changed;

  return (
    <>
      <Nav current="account" />
      <main className="mx-auto w-full max-w-[680px] px-5 pb-28 pt-10 sm:px-8 sm:pt-14">
        <h1 className="text-[34px] font-semibold tracking-[-0.045em]">Account</h1>
        <p className="mt-1 text-[14px] text-smoke">{viewer.user.email}</p>

        {welcome && (
          <p className="mt-8 rounded-[16px] border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-[13.5px] text-ash/90">
            You&rsquo;re on {plan.name}. caveira picks it up the next time you send a message.
          </p>
        )}

        <Panel title="Plan">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-[22px] font-semibold tracking-[-0.03em]">
              {plan.name}
              {plan.price > 0 && <span className="ml-2 text-[14px] font-normal text-smoke">${plan.price} / month</span>}
            </p>
            <Status viewer={viewer} />
          </div>
          <div className="mt-6">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full rounded-full bg-ash" style={{ width: `${Math.max(usage.used > 0 ? 1.5 : 0, usage.used * 100)}%` }} />
            </div>
            <p className="mt-2.5 text-[12.5px] text-smoke">
              {Math.round(usage.used * 100)}% of this month&rsquo;s usage · resets {resetDay()}
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            <Link href="/pricing" className="inline-flex h-9 items-center rounded-full bg-ash px-4 text-[13px] font-medium text-ink transition hover:bg-white">
              {plan.price > 0 ? 'Change plan' : 'Upgrade'}
            </Link>
            {viewer.user.stripeCustomerId && <ManageBilling />}
          </div>
        </Panel>

        <Panel title="Connected">
          {devices.length === 0 ? (
            <p className="text-[13.5px] leading-relaxed text-smoke">
              Nothing yet. Run <Code>caveira</Code> and type <Code>/login</Code>, or press Sign in in the app.
            </p>
          ) : (
            <ul className="-my-2 divide-y divide-white/[0.06]">
              {devices.map((d) => (
                <li key={d.id} className="flex items-center gap-3.5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-smoke">
                    {d.kind === 'tui' ? <SquareTerminal size={15} /> : <Laptop size={15} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px]">{d.label || 'Unnamed machine'}</p>
                    <p className="text-[12px] text-cinder">
                      {d.kind === 'tui' ? 'Terminal' : 'App'} · used {ago(d.lastUsedAt)}
                    </p>
                  </div>
                  <Disconnect id={d.id} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="mt-10">
          <SignOut />
        </div>
      </main>
      <Footer />
    </>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 rounded-[22px] border border-white/[0.07] bg-coal/80 p-6 sm:p-7">
      <h2 className="mb-5 text-[12.5px] font-medium text-smoke">{title}</h2>
      {children}
    </section>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[12px] text-ash">{children}</code>;
}

function Status({ viewer }: { viewer: Viewer }) {
  const sub = viewer.subscription;
  if (!sub || planOf(sub).price === 0) return null;
  const end = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null;
  if (sub.status === 'past_due') return <p className="text-[12.5px] text-ember">Payment failed. Update your card in Billing.</p>;
  if (sub.cancelAtPeriodEnd) return <p className="text-[12.5px] text-smoke">{end ? `Ends ${end}` : 'Ending'}</p>;
  return end ? <p className="text-[12.5px] text-smoke">Renews {end}</p> : null;
}

function ago(unixSeconds: number): string {
  const s = Math.max(0, Math.floor(Date.now() / 1000) - unixSeconds);
  if (s < 3600) return 'just now';
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 30 * 86_400) return `${Math.floor(s / 86_400)}d ago`;
  return new Date(unixSeconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
