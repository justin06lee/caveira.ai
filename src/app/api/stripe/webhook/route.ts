import type Stripe from 'stripe';

import { stripe, sync } from '@/lib/stripe';

// Stripe's events about money. Every one that concerns a customer's
// subscription re-reads it from Stripe and writes what it says, so order and
// repeats don't matter.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get('stripe-signature');
  if (!secret || !signature) return new Response('not configured', { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(await req.text(), signature, secret);
  } catch {
    return new Response('bad signature', { status: 400 });
  }

  const customer = customerOf(event);
  if (customer) await sync(customer);
  return new Response('ok');
}

const HANDLED = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'invoice.paid',
  'invoice.payment_failed',
]);

function customerOf(event: Stripe.Event): string | null {
  if (!HANDLED.has(event.type)) return null;
  const c = (event.data.object as { customer?: string | { id: string } | null }).customer;
  if (!c) return null;
  return typeof c === 'string' ? c : c.id;
}
