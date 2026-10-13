import Link from 'next/link';

import { COLUMN, EXTERNAL, REPO } from '@/lib/site';

import { Eye } from './Eye';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className={`${COLUMN} flex flex-col gap-4 py-9 text-[12.5px] text-cinder sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-center gap-2 text-smoke">
          <Eye className="h-4 w-4" />
          <span>caveira</span>
        </div>
        <nav className="flex gap-5">
          <Link href="/pricing" className="transition hover:text-ash">
            Pricing
          </Link>
          <Link href="/account" className="transition hover:text-ash">
            Account
          </Link>
          <a href={REPO} {...EXTERNAL} className="transition hover:text-ash">
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
