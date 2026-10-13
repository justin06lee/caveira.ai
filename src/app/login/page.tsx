import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthForm } from '@/components/AuthForm';
import { AuthShell } from '@/components/AuthShell';
import { currentViewer } from '@/lib/auth';
import { safeNext } from '@/lib/http';
import painting from '@/paintings/forest.webp';

export const metadata: Metadata = { title: 'Sign in' };

export default async function Page({ searchParams }: PageProps<'/login'>) {
  const { next } = await searchParams;
  const to = safeNext(typeof next === 'string' ? next : null);
  if (await currentViewer()) redirect(to);
  return (
    <AuthShell painting={painting}>
      <AuthForm mode="login" next={to} />
    </AuthShell>
  );
}
