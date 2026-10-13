import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

import { db } from '@/db';
import { subscriptions, users, type User } from '@/db/schema';

import { lookupKey, planByLookupKey, PLANS, type Plan } from './plans';

let client: Stripe | undefined;

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  client ??= new Stripe(key);
  return client;
}

// Without a Stripe key in development, picking a plan just puts the
// account on it, so the site can be tried end to end without cards.
// Production never does that.
export function devBilling(): boolean {
  return !process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'production';
}

// Tags our Checkout Sessions in the Dashboard.
const INTEGRATION = 'caveira_subscribe_qkvmrtza';

let prices: Map<string, string> | undefined;

// priceId finds the plan's monthly price by its lookup key.
export async function priceId(plan: Plan): Promise<string> {
  if (!prices) {
    const keys = PLANS.filter((p) => p.price > 0).map((p) => lookupKey(p.id));
    const list = await stripe().prices.list({ lookup_keys: keys, active: true, limit: keys.length });
    prices = new Map(list.data.map((p) => [p.lookup_key ?? '', p.id]));
  }
  const id = prices.get(lookupKey(plan.id));
  if (!id) throw new Error(`no active Stripe price with lookup key ${lookupKey(plan.id)}`);
  return id;
}

export async function ensureCustomer(user: User): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await stripe().customers.create({ email: user.email, metadata: { user_id: user.id } });
  await db().update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, user.id));
  return customer.id;
}

export async function checkout(user: User, plan: Plan, origin: string): Promise<string> {
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer: await ensureCustomer(user),
    client_reference_id: user.id,
    line_items: [{ price: await priceId(plan), quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/account?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?plan=${plan.id}`,
    subscription_data: { metadata: { user_id: user.id } },
    integration_identifier: INTEGRATION,
  } as Stripe.Checkout.SessionCreateParams);
  if (!session.url) throw new Error('Stripe returned no checkout url');
  return session.url;
}

let portalConfig: string | undefined;

// The portal configuration made for caveira (metadata app=caveira): plan
// switching between the four paid plans, cancelling, cards and invoices.
async function portalConfiguration(): Promise<string | undefined> {
  if (portalConfig) return portalConfig;
  const list = await stripe().billingPortal.configurations.list({ active: true, limit: 20 });
  portalConfig = list.data.find((c) => c.metadata?.app === 'caveira')?.id;
  return portalConfig;
}

export async function portal(
  user: User,
  origin: string,
  flow?: Stripe.BillingPortal.SessionCreateParams.FlowData,
): Promise<string> {
  const session = await stripe().billingPortal.sessions.create({
    customer: await ensureCustomer(user),
    return_url: `${origin}/account`,
    configuration: await portalConfiguration(),
    flow_data: flow,
  });
  return session.url;
}

// The flow that switches a running subscription to another paid plan, or
// cancels it for Free, confirmed on Stripe's page.
export async function changePlan(user: User, subscriptionId: string, itemId: string, plan: Plan, origin: string) {
  const after = { type: 'redirect' as const, redirect: { return_url: `${origin}/account?changed=1` } };
  if (plan.price === 0) {
    return portal(user, origin, {
      type: 'subscription_cancel',
      subscription_cancel: { subscription: subscriptionId },
      after_completion: after,
    });
  }
  return portal(user, origin, {
    type: 'subscription_update_confirm',
    subscription_update_confirm: { subscription: subscriptionId, items: [{ id: itemId, price: await priceId(plan), quantity: 1 }] },
    after_completion: after,
  });
}

// sync writes what Stripe says about a customer's subscription into the
// subscriptions table. The webhook and the checkout return both call it, so
// whichever arrives first is right and the other changes nothing.
export async function sync(customerId: string): Promise<void> {
  const [user] = await db().select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
  if (!user) return;

  const list = await stripe().subscriptions.list({ customer: customerId, status: 'all', limit: 10 });
  // The one that matters: a live one if there is any, else the newest.
  const live = new Set(['active', 'trialing', 'past_due', 'incomplete', 'unpaid']);
  const sub = list.data.find((s) => live.has(s.status)) ?? list.data[0];
  if (!sub) {
    await db().delete(subscriptions).where(eq(subscriptions.userId, user.id));
    return;
  }
  const item = sub.items.data[0];
  const plan = planByLookupKey(item?.price.lookup_key);
  const row = {
    stripeSubscriptionId: sub.id,
    stripeItemId: item?.id ?? null,
    planId: plan?.id ?? 'free',
    status: sub.status,
    currentPeriodEnd: item?.current_period_end ?? null,
    cancelAtPeriodEnd: sub.cancel_at_period_end || sub.cancel_at != null,
    updatedAt: Math.floor(Date.now() / 1000),
  };
  await db()
    .insert(subscriptions)
    .values({ userId: user.id, ...row })
    .onConflictDoUpdate({ target: subscriptions.userId, set: row });
}
