'use client';

import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

const FIELD =
  'h-11 w-full rounded-[12px] border border-white/[0.09] bg-white/[0.03] px-3.5 text-[14px] text-ash outline-none transition placeholder:text-cinder focus:border-ash/40 focus:bg-white/[0.05]';

export function AuthForm({ mode, next }: { mode: 'login' | 'signup'; next: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const signup = mode === 'signup';

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      const out = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(out.error ?? 'Something went wrong.');
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  const other = signup ? '/login' : '/signup';
  const keep = next === '/account' ? '' : `?next=${encodeURIComponent(next)}`;

  return (
    <form onSubmit={submit} className="w-full max-w-[340px]">
      <h1 className="text-[28px] font-semibold tracking-[-0.04em]">{signup ? 'Create your account' : 'Welcome back'}</h1>
      <p className="mt-2 text-[13.5px] text-smoke">{signup ? 'Free to start. No card needed.' : 'Sign in to caveira.'}</p>
      <div className="mt-8 space-y-3">
        <input name="email" type="email" required autoComplete="email" placeholder="Email" className={FIELD} autoFocus />
        <input
          name="password"
          type="password"
          required
          minLength={signup ? 8 : undefined}
          autoComplete={signup ? 'new-password' : 'current-password'}
          placeholder={signup ? 'Password, 8 characters or more' : 'Password'}
          className={FIELD}
        />
      </div>
      {error && <p className="mt-3 text-[13px] text-[#ff8a6b]">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ash text-[14px] font-medium text-ink transition hover:bg-white disabled:opacity-70"
      >
        {busy && <LoaderCircle size={15} className="animate-spin" />}
        {signup ? 'Create account' : 'Sign in'}
      </button>
      <p className="mt-6 text-center text-[13px] text-smoke">
        {signup ? 'Already have an account? ' : 'New to caveira? '}
        <Link href={`${other}${keep}`} className="text-ash underline decoration-white/25 underline-offset-2 transition hover:decoration-white/60">
          {signup ? 'Sign in' : 'Create one'}
        </Link>
      </p>
    </form>
  );
}
