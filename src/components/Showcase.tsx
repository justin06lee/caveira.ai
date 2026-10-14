import type { ReactNode } from 'react';

/**
 * One of the page's points: a painting with a live caveira window on one
 * side, the words on the other. It runs wider than the page's column.
 */
export function Showcase({ flip, stage, title, hint, children }: { flip?: boolean; stage: ReactNode; title: ReactNode; hint: ReactNode; children: ReactNode }) {
  return (
    <section
      className={`mx-auto grid max-w-[1480px] items-center gap-8 px-4 sm:px-8 lg:gap-16 lg:px-10 ${
        flip ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)]' : 'lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]'
      }`}
    >
      <div className={flip ? 'lg:order-2' : ''}>{stage}</div>
      <div className={`max-w-[420px] px-2 sm:px-0 lg:justify-self-center ${flip ? 'lg:order-1' : ''}`}>
        <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] sm:text-[40px]">{title}</h2>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-smoke">{children}</div>
        <p className="mt-6 text-[12.5px] leading-relaxed text-cinder">{hint}</p>
      </div>
    </section>
  );
}

/** A key, as the hints write them. */
export function Key({ children }: { children: ReactNode }) {
  return <kbd className="whitespace-nowrap rounded-[5px] border border-white/15 bg-white/[0.05] px-1 py-px font-sans text-[10.5px] text-ash/80">{children}</kbd>;
}
