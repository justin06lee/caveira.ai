import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthForm } from '@/components/AuthForm';
import { AuthShell } from '@/components/AuthShell';
import { currentViewer } from '@/lib/auth';
import { safeNext } from '@/lib/http';
import painting from '@/paintings/city.webp';

export const metadata: Metadata = { title: 'Create your account' };

export default async function Page({ searchParams }: PageProps<'/signup'>) {
  const { next } = await searchParams;
  const to = safeNext(typeof next === 'string' ? next : null);
  if (await currentViewer()) redirect(to);
  return (
    <AuthShell painting={painting}>
      <AuthForm mode="signup" next={to} />
    </AuthShell>
  );
}
