import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const now = sql`(unixepoch())`;

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  // Lowercased on the way in, so one address is one account.
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  createdAt: integer('created_at').notNull().default(now),
});

// Every way in is a session: the browser's cookie, and the token the
// terminal and desktop clients keep in ~/.caveira/auth.json. Only a hash of
// the token is stored, so a leaked table signs no one in.
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    tokenHash: text('token_hash').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['web', 'tui', 'desktop'] }).notNull(),
    // The machine's name, for the account page's list of connected devices.
    label: text('label'),
    createdAt: integer('created_at').notNull().default(now),
    lastUsedAt: integer('last_used_at').notNull().default(now),
    expiresAt: integer('expires_at').notNull(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
);

// A client's login waiting to be connected in the browser. The client
// polls with the device code (secret, stored hashed); the person checks the
// short user code on both screens.
export const deviceLogins = sqliteTable('device_logins', {
  id: text('id').primaryKey(),
  deviceCodeHash: text('device_code_hash').notNull().unique(),
  userCode: text('user_code').notNull().unique(),
  client: text('client', { enum: ['tui', 'desktop'] }).notNull(),
  label: text('label'),
  status: text('status', { enum: ['pending', 'approved', 'denied'] })
    .notNull()
    .default('pending'),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at').notNull().default(now),
  expiresAt: integer('expires_at').notNull(),
});

// Stripe holds the money; this row is the cached answer to "what plan is
// this account on", written by the webhook and by the checkout return.
export const subscriptions = sqliteTable('subscriptions', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id').notNull(),
  stripeItemId: text('stripe_item_id'),
  planId: text('plan_id').notNull(),
  status: text('status').notNull(),
  currentPeriodEnd: integer('current_period_end'),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).notNull().default(false),
  updatedAt: integer('updated_at').notNull().default(now),
});

// One row per model reply that went through the proxy, priced at what
// abliteration.ai charges for it, in millionths of a dollar.
export const usage = sqliteTable(
  'usage',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    model: text('model').notNull(),
    inputTokens: integer('input_tokens').notNull(),
    cachedTokens: integer('cached_tokens').notNull(),
    outputTokens: integer('output_tokens').notNull(),
    costMicros: integer('cost_micros').notNull(),
    // Counted from the stream when the reply ended without a usage report.
    estimated: integer('estimated', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => [index('usage_user_time_idx').on(t.userId, t.createdAt)],
);

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
