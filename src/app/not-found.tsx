import Link from 'next/link';

import { Eye } from '@/components/Eye';

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <Eye className="h-10 w-10 text-smoke" />
      <h1 className="mt-6 text-[28px] font-semibold tracking-[-0.04em]">Nothing here</h1>
      <p className="mt-2 text-[14px] text-smoke">The page you followed doesn&rsquo;t exist, or burned down.</p>
      <Link href="/" className="mt-8 inline-flex h-10 items-center rounded-full bg-ash px-5 text-[13px] font-medium text-ink transition hover:bg-white">
        Back to caveira
      </Link>
    </main>
  );
}
