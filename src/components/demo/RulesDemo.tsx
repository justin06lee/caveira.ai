'use client';

import { useState } from 'react';

import { ComposerBox, Header, MODELS, Sidebar, TrafficLights, Transcript, useTurn, type Composer, type Item, type Project, type Step } from './kit';

const PROJECTS: Project[] = [
  { name: 'heist', open: true, chats: [{ title: 'What is eating the disk', when: 'now' }, { title: 'Map the vault floor plan', when: '2d' }] },
  { name: 'payroll-api', chats: [] },
];

const EARLIER: Item[] = [
  { kind: 'user', text: "What's eating all the disk in this repo?" },
  { kind: 'tool', verb: 'Run', target: 'du -sh * | sort -h', meta: '6 lines', output: ['4.0K  README.md', ' 88M  node_modules', '1.2G  dist'] },
  { kind: 'reply', text: 'dist is 1.2 GB: every build since March, never cleaned. Everything else is under 100 MB.' },
  { kind: 'stats', text: '9s · 1 tool · $0.0021' },
];

const COMMAND = 'rm -rf dist && bun run build';

// How long it thinks before acting, by the effort set.
const THINK: Record<string, number> = { None: 300, Minimal: 500, Low: 700, Default: 900, Medium: 1100, High: 1500, 'Extra high': 1900, Max: 2300 };

function steps(c: Composer): Step[] {
  const s = (wait: number, item: Item): Step => ({ wait, item });
  const secs = Math.round(THINK[c.effort] / 120) + 6;
  return [
    s(THINK[c.effort], { kind: 'thought', text: '' }),
    s(600, { kind: 'tool', verb: 'Read', target: 'package.json', meta: '41 lines' }),
    ...(c.ask ? [s(600, { kind: 'approval', command: COMMAND })] : []),
    s(c.ask ? 300 : 900, { kind: 'tool', verb: 'Run', target: COMMAND, meta: 'built in 4.1s', output: ['$ bun run build', 'dist/app.js  412 KB', 'built in 4.1s'] }),
    s(600, { kind: 'reply', text: 'Cleared the old builds and built it fresh: dist is 412 KB now, down from 1.2 GB.' }),
    s(100, { kind: 'stats', text: `${secs}s · 2 tools · ${c.model.name}${c.effort === 'Default' ? '' : ` · ${c.effort}`} · $0.00${c.model.maker === 'zai' ? '47' : '19'}` }),
  ];
}

const DENIED: Item[] = [
  { kind: 'reply', text: "Okay, I left dist alone. Say if you want me to clear only the builds older than a week instead." },
  { kind: 'stats', text: '6s · 1 tool · $0.0011' },
];

/** A chat with the model, effort and permissions all yours to set. */
export function RulesDemo() {
  const turn = useTurn(EARLIER);
  const [composer, setComposer] = useState<Composer>({ model: MODELS[2], effort: 'High', ask: true });

  return (
    <div className="flex h-full">
      <TrafficLights />
      <Sidebar projects={PROJECTS} active="What is eating the disk" />
      <main className="flex min-w-0 flex-1 flex-col">
        <Header title="What is eating the disk" />
        <Transcript items={turn.items} working={turn.working} verb={turn.verb} seconds={turn.seconds} onAnswer={turn.answer} />
        <div className="px-10 pb-5">
          <div className="mx-auto max-w-[580px]">
            <ComposerBox
              state={composer}
              onChange={setComposer}
              onSend={(t) => turn.play(t, steps(composer), { command: COMMAND, denied: DENIED })}
              busy={turn.busy}
              suggestion="Clear out dist and build it fresh"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
