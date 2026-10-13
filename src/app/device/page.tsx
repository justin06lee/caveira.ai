import { and, eq, gt } from 'drizzle-orm';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthShell } from '@/components/AuthShell';
import { CodeEntry, DeviceApproval } from '@/components/DeviceApproval';
import { db } from '@/db';
import { deviceLogins } from '@/db/schema';
import { currentViewer, unix } from '@/lib/auth';
import creation from '@/paintings/creation.webp';

export const metadata: Metadata = { title: 'Connect caveira' };

// Where the terminal and the app send the browser to finish signing in.
export default async function Device({ searchParams }: PageProps<'/device'>) {
  const raw = (await searchParams).code;
  const code = typeof raw === 'string' ? raw.trim().toUpperCase() : '';

  const viewer = await currentViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(code ? `/device?code=${code}` : '/device')}`);

  let body;
  if (!code) {
    body = <CodeEntry />;
  } else {
    const [login] = await db()
      .select()
      .from(deviceLogins)
      .where(and(eq(deviceLogins.userCode, code), eq(deviceLogins.status, 'pending'), gt(deviceLogins.expiresAt, unix())))
      .limit(1);
    body = login ? (
      <DeviceApproval login={{ code, client: login.client, label: login.label }} email={viewer.user.email} />
    ) : (
      <CodeEntry problem="That code has expired or was already used. Start the login again in caveira, or type the new code." />
    );
  }

  return (
    <AuthShell painting={creation}>
      <div className="w-full max-w-[360px]">{body}</div>
    </AuthShell>
  );
}
