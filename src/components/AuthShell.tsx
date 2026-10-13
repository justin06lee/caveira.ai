import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Eye } from './Eye';

/** A painting on one side, the form on the other; just the form on a phone. */
export function AuthShell({ painting, children }: { painting: StaticImageData; children: ReactNode }) {
  return (
    <div className="grid min-h-[100svh] lg:grid-cols-[1.1fr_1fr]">
      <div className="relative isolate hidden overflow-hidden lg:block">
        <Image src={painting} alt="" fill priority placeholder="blur" quality={80} sizes="55vw" className="settle -z-10 object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_60%,var(--color-ink))]" />
      </div>
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5 self-start" aria-label="caveira home">
          <Eye className="h-[22px] w-[22px]" />
          <span className="text-[15px] font-semibold tracking-tight">caveira</span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-12">{children}</div>
      </div>
    </div>
  );
}
