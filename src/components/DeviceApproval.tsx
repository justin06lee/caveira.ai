'use client';

import { CircleCheck, CircleX, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

type Login = { code: string; client: 'tui' | 'desktop'; label: string | null };

const WHAT = { tui: 'The terminal', desktop: 'The caveira app' } as const;

/** Connects a waiting client login to the signed-in account. */
export function DeviceApproval({ login, email }: { login: Login; email: string }) {
  const [state, setState] = useState<'ask' | 'busy' | 'connected' | 'cancelled'>('ask');
  const [error, setError] = useState('');

  async function answer(approve: boolean) {
    setState('busy');
    setError('');
    try {
      const res = await fetch('/api/auth/device/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_code: login.code, approve }),
      });
      const out = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(out.error ?? 'Something went wrong.');
      setState(approve ? 'connected' : 'cancelled');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState('ask');
    }
  }

  if (state === 'connected' || state === 'cancelled') {
    const ok = state === 'connected';
    return (
      <div className="text-center">
        {ok ? <CircleCheck size={34} className="mx-auto text-ash" /> : <CircleX size={34} className="mx-auto text-smoke" />}
        <h1 className="mt-5 text-[24px] font-semibold tracking-[-0.03em]">{ok ? 'Connected' : 'Cancelled'}</h1>
        <p className="mt-2 text-[14px] text-smoke">
          {ok ? 'You can close this tab and go back to caveira.' : 'Nothing was connected. You can close this tab.'}
        </p>
      </div>
    );
  }

  const where = login.label ? ` on ${login.label}` : '';
  return (
    <div className="text-center">
      <h1 className="text-[26px] font-semibold tracking-[-0.035em]">Connect caveira</h1>
      <p className="mx-auto mt-3 max-w-[330px] text-[14px] leading-relaxed text-smoke">
        {WHAT[login.client]}
        {where} wants to use your account, <span className="text-ash">{email}</span>.
      </p>
      <div className="mt-8 rounded-[16px] border border-white/[0.09] bg-white/[0.03] py-5 font-mono text-[26px] tracking-[0.2em] text-ash">
        {login.code}
      </div>
      <p className="mt-3 text-[12.5px] text-cinder">Check that it matches the code caveira is showing.</p>
      {error && <p className="mt-4 text-[13px] text-[#ff8a6b]">{error}</p>}
      <div className="mt-8 flex gap-2.5">
        <button
          type="button"
          disabled={state === 'busy'}
          onClick={() => answer(false)}
          className="h-11 flex-1 rounded-full bg-white/[0.07] text-[14px] font-medium text-ash transition hover:bg-white/[0.12]"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={state === 'busy'}
          onClick={() => answer(true)}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ash text-[14px] font-medium text-ink transition hover:bg-white"
        >
          {state === 'busy' && <LoaderCircle size={15} className="animate-spin" />}
          Connect
        </button>
      </div>
    </div>
  );
}

/** Asks for the code when the page was opened without one. */
export function CodeEntry({ problem }: { problem?: string }) {
  const router = useRouter();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get('code') ?? '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    if (code.length === 8) router.push(`/device?code=${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return (
    <form onSubmit={submit} className="text-center">
      <h1 className="text-[26px] font-semibold tracking-[-0.035em]">Connect caveira</h1>
      <p className="mx-auto mt-3 max-w-[320px] text-[14px] leading-relaxed text-smoke">
        {problem ?? 'Type the code caveira is showing.'}
      </p>
      <input
        name="code"
        required
        autoFocus
        autoComplete="off"
        spellCheck={false}
        placeholder="ABCD-EFGH"
        className="mt-8 h-16 w-full rounded-[16px] border border-white/[0.09] bg-white/[0.03] text-center font-mono text-[24px] uppercase tracking-[0.2em] text-ash outline-none placeholder:text-cinder/60 focus:border-ash/40"
      />
      <button type="submit" className="mt-6 h-11 w-full rounded-full bg-ash text-[14px] font-medium text-ink transition hover:bg-white">
        Continue
      </button>
    </form>
  );
}
