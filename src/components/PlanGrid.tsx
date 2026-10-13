'use client';

import { Check, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { POPULAR, type Plan, type PlanId } from '@/lib/plans';

type Props = {
  plans: Plan[];
  // The account's plan, null when signed out.
  current: PlanId | null;
  // The plan a client sent the person here for.
  pick?: PlanId;
};

export function PlanGrid({ plans, current, pick }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [error, setError] = useState('');
  const paidNow = current !== null && current !== 'free';

  async function choose(plan: Plan) {
    if (current === null) {
      const back = plan.price ? `/pricing?plan=${plan.id}` : '/account';
      router.push(`/signup?next=${encodeURIComponent(back)}`);
      return;
    }
    setBusy(plan.id);
    setError('');
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id }),
      });
      const out = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !out.url) throw new Error(out.error ?? 'Something went wrong.');
      window.location.assign(out.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(null);
    }
  }

  function label(plan: Plan): string {
    if (plan.id === current) return 'Current plan';
    if (current === null) return plan.price ? 'Subscribe' : 'Start free';
    if (plan.price === 0) return 'Switch to Free';
    return paidNow ? 'Switch' : 'Subscribe';
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {plans.map((plan) => {
          const popular = plan.id === POPULAR;
          const picked = plan.id === pick;
          const isCurrent = plan.id === current;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[22px] border bg-coal/80 p-6 ${
                picked ? 'border-ash/50' : popular ? 'border-ember/35' : 'border-white/[0.07]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-medium">{plan.name}</h2>
                {popular && <span className="text-[11px] font-medium text-ember">Popular</span>}
              </div>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-[34px] font-semibold leading-none tracking-[-0.04em]">${plan.price}</span>
                <span className="text-[12.5px] text-smoke">/ month</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-[13px] leading-snug text-ash/85">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check size={14} className="mt-[3px] shrink-0 text-smoke" />
                    <span>{keepWhole(f)}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={isCurrent || busy !== null}
                onClick={() => choose(plan)}
                className={`mt-7 inline-flex h-10 items-center justify-center gap-2 rounded-full text-[13px] font-medium transition disabled:cursor-default ${
                  isCurrent
                    ? 'bg-white/[0.05] text-smoke'
                    : popular || picked
                      ? 'bg-ash text-ink hover:bg-white'
                      : 'bg-white/[0.08] text-ash hover:bg-white/[0.14]'
                }`}
              >
                {busy === plan.id && <LoaderCircle size={14} className="animate-spin" />}
                {label(plan)}
              </button>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-5 text-center text-[13px] text-[#ff8a6b]">{error}</p>}
    </>
  );
}

// keepWhole stops a model name like GLM-5.3 breaking at its hyphen.
function keepWhole(text: string) {
  return text.split(' ').map((word, i) => (
    <span key={i}>
      {i > 0 && ' '}
      {word.includes('-') ? <span className="whitespace-nowrap">{word}</span> : word}
    </span>
  ));
}
