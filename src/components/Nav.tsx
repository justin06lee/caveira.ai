import Link from 'next/link';

import { currentViewer } from '@/lib/auth';
import { COLUMN, EXTERNAL, REPO } from '@/lib/site';

import { Eye } from './Eye';
import { GithubMark } from './GithubMark';

const LINK = 'rounded-full px-3 py-1.5 transition hover:bg-white/[0.07] hover:text-ash';

/** The top bar. Over the hero it floats on the painting. */
export async function Nav({ current, overlay }: { current?: 'pricing' | 'account'; overlay?: boolean }) {
  const signedIn = Boolean(await currentViewer());
  const here = (page: string) => (current === page ? 'text-ash' : '');
  return (
    <header className={`${overlay ? 'absolute inset-x-0 top-0 z-20' : ''}`}>
      <div className={`${COLUMN} flex items-center justify-between py-5`}>
        <Link href="/" className="flex items-center gap-2.5" aria-label="caveira home">
          <Eye className="h-[22px] w-[22px]" />
          <span className="text-[15px] font-semibold tracking-tight">caveira</span>
        </Link>
        <nav className="-mr-2 flex items-center gap-0.5 text-[13px] text-smoke">
          <Link href="/pricing" className={`${LINK} ${here('pricing')}`}>
            Pricing
          </Link>
          <Link href="/#install" className={`${LINK} max-sm:hidden`}>
            Install
          </Link>
          <a href={REPO} {...EXTERNAL} aria-label="caveira on GitHub" className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/[0.07] hover:text-ash">
            <GithubMark />
          </a>
          {signedIn ? (
            <Link href="/account" className={`${LINK} ${here('account')}`}>
              Account
            </Link>
          ) : (
            <Link href="/login" className="ml-1.5 rounded-full bg-ash/[0.09] px-3.5 py-1.5 text-ash transition hover:bg-ash/[0.15]">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
