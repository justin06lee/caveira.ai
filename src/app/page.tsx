import { ArrowRight, Download, SquareTerminal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Command } from '@/components/Command';
import { ImportDemo } from '@/components/demo/ImportDemo';
import { RulesDemo } from '@/components/demo/RulesDemo';
import { Stage } from '@/components/demo/Stage';
import { WorkDemo } from '@/components/demo/WorkDemo';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { Key, Showcase } from '@/components/Showcase';
import city from '@/paintings/city.webp';
import creation from '@/paintings/creation.webp';
import forest from '@/paintings/forest.webp';
import money from '@/paintings/money.webp';
import riot from '@/paintings/riot.webp';
import { COLUMN, DOWNLOAD_MAC, EXTERNAL, INSTALL } from '@/lib/site';

export default function Home() {
  return (
    <>
      <Hero />
      <main>
        <div className="space-y-28 pt-16 sm:space-y-40 sm:pt-24">
          <NoRefusals />
          <Defect />
          <YourRules />
        </div>
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
    <Showcase
      title={
        <>
          No refusals.
          <br />
          No lectures.
        </>
      }
      stage={
        <Stage painting={money} alt="Hundred-dollar bills burning">
          <WorkDemo />
        </Stage>
      }
      hint={
        <>
          Try it: type anything and press <Key>Enter</Key>, or pick one of the ideas under the box. Open a line it ran to see what it changed.
        </>
      }
    >
      <p>The refusals are cut out of its models, so the tokens you pay for go into the work. It reads the code, makes the change, runs it, and checks that it worked.</p>
    </Showcase>
  );
}

function Defect() {
  return (
    <Showcase
      flip
      title={
        <>
          Defect.
          <br />
          Bring your chats.
        </>
      }
      stage={
        <Stage painting={riot} alt="A crowd storming a burning city">
          <ImportDemo />
        </Stage>
      }
      hint={<>Try it: press Import, then open one of the chats it brought over and keep going.</>}
    >
      <p>caveira picks up your Claude Code, Codex and OpenCode chats where you left them. The terminal and the app share every one.</p>
    </Showcase>
  );
}

function YourRules() {
  return (
    <Showcase
      title={
        <>
          Open models.
          <br />
          Your rules.
        </>
      }
      stage={
        <Stage painting={city} alt="A city burning under a red sun">
          <RulesDemo />
        </Stage>
      }
      hint={
        <>
          Try it: switch the model or the effort, flip permissions with <Key>⇧ Tab</Key>, then send something. You can drag the window by its top bar, too.
        </>
      }
    >
      <p>Abliterated Qwen3.5, GLM-5.2 and GLM-5.3, with up to a million tokens of context. You set how hard it thinks, and whether it asks before it acts.</p>
    </Showcase>
  );
}

function Install() {
  return (
    <section id="install" className="relative isolate mt-16 scroll-mt-4 overflow-hidden pb-28 pt-56 sm:mt-24 sm:pb-40 sm:pt-72">
      <Image src={forest} alt="" fill placeholder="blur" quality={80} sizes="100vw" className="-z-20 object-cover object-[50%_60%]" />
      {/* A long, eased fade in from the page above, so the forest rises out
          of the dark rather than starting at a line. */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--color-ink),rgb(12_8_6/0.97)_8%,rgb(12_8_6/0.9)_16%,rgb(12_8_6/0.78)_24%,rgb(12_8_6/0.62)_32%,rgb(12_8_6/0.48)_41%,rgb(12_8_6/0.4)_50%,rgb(12_8_6/0.42)_72%,rgb(12_8_6/0.7)_88%,var(--color-ink))]" />

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
