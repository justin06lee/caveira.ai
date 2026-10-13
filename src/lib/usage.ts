import { and, eq, gte, sql } from 'drizzle-orm';

import { db } from '@/db';
import { usage } from '@/db/schema';

import { costMicros, usageUnitUSD, type Model, type Plan } from './plans';

// Usage is counted by calendar month, in UTC, for every plan: it resets on
// the 1st.
export function period(now = new Date()): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export function limitMicros(plan: Plan): number {
  return Math.round(plan.usage * usageUnitUSD() * 1_000_000);
}

export async function usedMicros(userId: string): Promise<number> {
  const start = Math.floor(period().start.getTime() / 1000);
  const [row] = await db()
    .select({ total: sql<number>`coalesce(sum(${usage.costMicros}), 0)` })
    .from(usage)
    .where(and(eq(usage.userId, userId), gte(usage.createdAt, start)));
  return Number(row?.total ?? 0);
}

export type UsageSummary = {
  // The share of this month's usage already spent, 0 to 1.
  used: number;
  resets_at: string;
};

export async function summary(userId: string, plan: Plan): Promise<UsageSummary> {
  const used = await usedMicros(userId);
  return { used: Math.min(1, used / limitMicros(plan)), resets_at: period().end.toISOString() };
}

export async function record(
  userId: string,
  model: Model,
  t: { input: number; cached: number; output: number; estimated: boolean },
): Promise<void> {
  if (t.input + t.output === 0) return;
  await db()
    .insert(usage)
    .values({
      userId,
      model: model.id,
      inputTokens: t.input,
      cachedTokens: t.cached,
      outputTokens: t.output,
      costMicros: costMicros(model, t.input, t.cached, t.output),
      estimated: t.estimated,
    });
}

export function resetDay(): string {
  return period().end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
}
