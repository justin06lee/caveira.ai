import { ArrowRight, Download, FolderInput, ShieldOff, SquareTerminal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Command } from '@/components/Command';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import city from '@/paintings/city.webp';
import creation from '@/paintings/creation.webp';
import forest from '@/paintings/forest.webp';
import { COLUMN, DOWNLOAD_MAC, EXTERNAL, INSTALL } from '@/lib/site';

export default function Home() {
  return (
    <>
      <Hero />
      <main>
        <NoRefusals />
        <Facts />
        <Install />
      </main>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate h-[100svh] max-h-[1000px] min-h-[640px] overflow-hidden">
      {/* The painting holds the top of the screen, the words sit under the
          skull rather than across it. */}
      <div className="absolute inset-x-0 top-0 -z-20 h-[80%] overflow-hidden">
        <Image
          src={creation}
          alt="Two hands reach for a skull over a burning city"
          fill
          priority
          placeholder="blur"
          quality={80}
          sizes="100vw"
          className="settle object-cover"
        />
      </div>
      {/* Dark enough at the top for the nav, and down into the page below. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[calc(80%_+_2px)] bg-[linear-gradient(to_bottom,rgb(12_8_6/0.6),transparent_20%,transparent_48%,rgb(12_8_6/0.82)_76%,var(--color-ink)_94%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[80%] bg-[radial-gradient(ellipse_at_50%_45%,transparent_50%,rgb(12_8_6/0.6))]" />
      <Nav overlay />

      <div className={`${COLUMN} absolute inset-x-0 bottom-0 flex flex-col items-center pb-14 text-center sm:pb-20`}>
        <h1 className="rise text-[64px] font-semibold leading-none tracking-[-0.055em] [animation-delay:300ms] sm:text-[96px]">caveira</h1>
        <p className="rise mt-5 text-[19px] font-medium tracking-tight [animation-delay:420ms] sm:text-[22px]">The coding agent that doesn&rsquo;t refuse.</p>
        <p className="rise mt-3 max-w-[440px] text-[14.5px] leading-relaxed text-smoke [animation-delay:500ms]">
          Abliterated open models that read, write and run your code. In your terminal, or on your desktop.
        </p>
        <div className="rise mt-9 flex flex-wrap items-center justify-center gap-2.5 [animation-delay:600ms]">
          <a
            href={DOWNLOAD_MAC}
            {...EXTERNAL}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-ash pl-5 pr-6 text-[14px] font-medium text-ink transition hover:bg-white"
          >
            <Download size={16} /> Download for macOS
          </a>
          <Link
            href="/#install"
            className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14px] font-medium text-ash/85 transition hover:bg-white/[0.08] hover:text-ash"
          >
            <SquareTerminal size={16} /> Install in the terminal
          </Link>
        </div>
        <p className="rise mt-4 text-[11.5px] text-cinder [animation-delay:680ms]">
          Free to start ·{' '}
          <Link href="/pricing" className="underline decoration-white/20 underline-offset-2 transition hover:text-smoke">
            plans from $20 a month
          </Link>
        </p>
      </div>
    </section>
  );
}

function NoRefusals() {
  return (
    <section className={`${COLUMN} pt-20 sm:pt-28`}>
      <h2 className="max-w-[640px] text-[34px] font-semibold leading-[1.1] tracking-[-0.04em] sm:text-[46px]">
        No refusals. No lectures.
        <br />
        <span className="text-smoke">Just the work.</span>
      </h2>
      <p className="mt-5 max-w-[470px] text-[15px] leading-relaxed text-smoke">
        The refusals are cut out of its models, so it does what you ask: it reads the code, makes the change, runs it, and checks that it worked.
      </p>
      <figure className="relative mt-12 overflow-hidden rounded-[28px] border border-white/[0.06]">
        <Image
          src={city}
          alt="A city burning under a red sun"
          placeholder="blur"
          quality={80}
          sizes="(min-width: 1080px) 1016px, 100vw"
          className="aspect-[16/10] w-full object-cover sm:aspect-[16/9]"
        />
        <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgb(12_8_6/0.85),transparent)] px-6 pb-5 pt-16 text-[13px] text-ash/80 sm:px-8 sm:pb-7">
          Qwen3.5, GLM-5.2 and GLM-5.3, abliterated. Up to a million tokens of context.
        </figcaption>
      </figure>
    </section>
  );
}

function Fact({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-smoke">{icon}</div>
      <h3 className="mt-4 text-[15px] font-medium">{title}</h3>
      <p className="mt-1 text-[13.5px] leading-relaxed text-smoke">{children}</p>
    </div>
  );
}

function Facts() {
  return (
    <section className={`${COLUMN} grid gap-10 pt-20 sm:grid-cols-3 sm:gap-8 sm:pt-24`}>
      <Fact icon={<SquareTerminal size={16} />} title="Terminal and desktop">
        One agent and one set of chats, in both. Start in one, finish in the other.
      </Fact>
      <Fact icon={<FolderInput size={16} />} title="Bring your chats">
        Picks up your Claude Code, Codex and OpenCode chats where you left them.
      </Fact>
      <Fact icon={<ShieldOff size={16} />} title="Your call">
        It asks before it runs a command or edits a file, or it doesn&rsquo;t. Switch with a key.
      </Fact>
    </section>
  );
}

function Install() {
  return (
    <section id="install" className="relative isolate mt-24 scroll-mt-4 overflow-hidden py-28 sm:mt-32 sm:py-40">
      <Image src={forest} alt="" fill placeholder="blur" quality={80} sizes="100vw" className="-z-20 object-cover object-[50%_60%]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--color-ink),rgb(12_8_6/0.4)_30%,rgb(12_8_6/0.45)_70%,var(--color-ink))]" />

      <div className={COLUMN}>
        <h2 className="text-center text-[34px] font-semibold tracking-[-0.04em] sm:text-[46px]">Get caveira</h2>
        <p className="mt-3 text-center text-[14.5px] text-ash/75">Then sign in, and you&rsquo;re working.</p>

        <div className="mx-auto mt-12 grid max-w-[880px] gap-4 md:grid-cols-2">
          <Card title="The app" note="For macOS 13 or later.">
            <a
              href={DOWNLOAD_MAC}
              {...EXTERNAL}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-ash pl-4 pr-5 text-[13px] font-medium text-ink transition hover:bg-white"
            >
              <Download size={15} /> Download for macOS
            </a>
            <p className="mt-5 text-[13px] leading-relaxed text-smoke">Open it, press Sign in, and finish in your browser.</p>
          </Card>
          <Card title="The terminal" note="macOS and Linux. Needs Go and bun.">
            <Command>{INSTALL}</Command>
            <p className="mt-4 text-[13px] leading-relaxed text-smoke">
              Run <code className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[12px] text-ash">caveira</code> in a project and type{' '}
              <code className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[12px] text-ash">/login</code>.
            </p>
          </Card>
        </div>

        <p className="mt-10 text-center">
          <Link href="/pricing" className="inline-flex items-center gap-1.5 text-[13.5px] text-ash/80 transition hover:text-ash">
            See the plans <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    </section>
  );
}

function Card({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-ink/70 p-7 backdrop-blur-md">
      <h3 className="text-[16px] font-medium">{title}</h3>
      <p className="mt-1 text-[13px] text-smoke">{note}</p>
      {children}
    </div>
  );
}
