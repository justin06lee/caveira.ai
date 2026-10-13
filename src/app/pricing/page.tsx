import type { Metadata } from 'next';
import Image from 'next/image';

import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { PlanGrid } from '@/components/PlanGrid';
import { currentViewer, planOf } from '@/lib/auth';
import { planById, PLANS } from '@/lib/plans';
import { COLUMN } from '@/lib/site';
import forest from '@/paintings/forest.webp';

export const metadata: Metadata = { title: 'Pricing' };

export default async function Pricing({ searchParams }: PageProps<'/pricing'>) {
  const { plan } = await searchParams;
  const viewer = await currentViewer();
  const pick = planById(typeof plan === 'string' ? plan : null)?.id;

  return (
    <div className="relative isolate">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden [mask-image:linear-gradient(to_bottom,black,transparent)]">
        <Image src={forest} alt="" fill priority placeholder="blur" quality={80} sizes="100vw" className="object-cover object-[50%_30%] opacity-35" />
      </div>
      <Nav current="pricing" />
      <main className={`${COLUMN} pb-28 pt-12 sm:pt-16`}>
        <div className="text-center">
          <h1 className="text-[40px] font-semibold tracking-[-0.045em] sm:text-[52px]">Pricing</h1>
          <p className="mt-3 text-[15px] text-smoke">Start free. Every plan works in the terminal and the app.</p>
        </div>
        <div className="mt-12">
          <PlanGrid plans={PLANS} current={viewer ? planOf(viewer.subscription).id : null} pick={pick} />
        </div>
        <p className="mt-10 text-center text-[12.5px] leading-relaxed text-cinder">
          Usage resets on the 1st of every month. Prices in US dollars. Cancel any time.
        </p>
      </main>
      <Footer />
    </div>
  );
}
