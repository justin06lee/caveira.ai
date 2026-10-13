'use client';

import { LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

async function post(url: string, method = 'POST'): Promise<{ url?: string }> {
  const res = await fetch(url, { method });
  const out = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) throw new Error(out.error ?? 'Something went wrong.');
  return out;
}

function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }
  return { busy, error, run };
}

const SOFT = 'inline-flex h-9 items-center gap-2 rounded-full bg-white/[0.07] px-4 text-[13px] font-medium text-ash transition hover:bg-white/[0.12] disabled:opacity-60';

function Busy({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <>
      {busy && <LoaderCircle size={13} className="animate-spin" />}
      {children}
    </>
  );
}

export function ManageBilling() {
  const { busy, error, run } = useAction();
  return (
    <span>
      <button type="button" disabled={busy} className={SOFT} onClick={() => run(async () => window.location.assign((await post('/api/billing/portal')).url!))}>
        <Busy busy={busy}>Billing</Busy>
      </button>
      {error && <span className="ml-3 text-[12.5px] text-[#ff8a6b]">{error}</span>}
    </span>
  );
}

export function SignOut() {
  const router = useRouter();
  const { busy, run } = useAction();
  return (
    <button
      type="button"
      disabled={busy}
      className="text-[13px] text-smoke underline decoration-white/20 underline-offset-2 transition hover:text-ash"
      onClick={() =>
        run(async () => {
          await post('/api/auth/logout');
          router.replace('/');
          router.refresh();
        })
      }
    >
      Sign out
    </button>
  );
}

export function Disconnect({ id }: { id: string }) {
  const router = useRouter();
  const { busy, run } = useAction();
  return (
    <button
      type="button"
      disabled={busy}
      className="rounded-full px-3 py-1.5 text-[12.5px] text-smoke transition hover:bg-white/[0.07] hover:text-ash"
      onClick={() =>
        run(async () => {
          await post(`/api/sessions/${id}`, 'DELETE');
          router.refresh();
        })
      }
    >
      {busy ? 'Disconnecting…' : 'Disconnect'}
    </button>
  );
}
