'use client';

import { useState } from 'react';

import { ComposerBox, Header, MODELS, Sidebar, TrafficLights, Transcript, useTurn, Welcome, type Composer, type Project } from './kit';
import { scriptFor, SUGGESTIONS } from './scripts';

const PROJECTS: Project[] = [
  { name: 'heist', open: true, chats: [] },
  { name: 'payroll-api', chats: [] },
  { name: 'dotfiles', chats: [] },
];

const EARLIER = [
  { title: 'Make the deploy script quiet', when: '2h' },
  { title: 'Strip the analytics calls', when: '1d' },
];

/** A new chat: type anything, and watch caveira do it. */
export function WorkDemo() {
  const turn = useTurn();
  const [composer, setComposer] = useState<Composer>({ model: MODELS[0], effort: 'Default', ask: false });
  const [title, setTitle] = useState<string | null>(null);
  const [pick, setPick] = useState(0);

  const send = (text: string) => {
    const { title: t, steps } = scriptFor(text);
    setTitle((prev) => prev ?? t);
    turn.play(text, steps);
  };

  const chats = [...(title ? [{ title, when: 'now' }] : [{ title: 'New chat', when: '' }]), ...EARLIER];
  const projects = PROJECTS.map((p) => (p.open ? { ...p, chats } : p));
  const box = (
    <ComposerBox
      state={composer}
      onChange={setComposer}
      onSend={send}
      busy={turn.busy}
      suggestion={title ? undefined : SUGGESTIONS[pick]}
    />
  );

  return (
    <div className="flex h-full">
      <TrafficLights />
      <Sidebar projects={projects} active={title ?? 'New chat'} />
      <main className="flex min-w-0 flex-1 flex-col">
        <Header title={title ?? ''} />
        {title ? (
          <>
            <Transcript items={turn.items} working={turn.working} verb={turn.verb} seconds={turn.seconds} />
            <div className="px-10 pb-5">
              <div className="mx-auto max-w-[580px]">{box}</div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-12 pb-10">
            <Welcome greeting="Hiding in plain sight. What's the move?" project="heist" />
            <div className="mt-7 w-full max-w-[560px]">{box}</div>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5" data-no-drag>
              {SUGGESTIONS.map((sug, i) => (
                <button
                  key={sug}
                  type="button"
                  onMouseEnter={() => setPick(i)}
                  onClick={() => send(sug)}
                  className="rounded-full border border-app-line bg-app-surface px-3 py-1 text-[11px] text-app-muted transition hover:border-app-line-strong hover:text-app-text"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
