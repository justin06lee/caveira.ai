'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Eye } from '@/components/Eye';

import { ComposerBox, Header, MODELS, Sidebar, TrafficLights, Transcript, useTurn, type Composer, type Item, type Project } from './kit';
import { GENERIC } from './scripts';

type Source = { id: string; name: string; projects: number; chats: number };

const SOURCES: Source[] = [
  { id: 'claude', name: 'Claude Code', projects: 12, chats: 286 },
  { id: 'codex', name: 'Codex', projects: 4, chats: 37 },
  { id: 'opencode', name: 'OpenCode', projects: 2, chats: 9 },
];

// What the import brings over: projects, their chats, and the chats' turns.
const IMPORTED: (Project & { from: string })[] = [
  {
    name: 'payroll-api',
    from: 'Claude Code',
    open: true,
    chats: [
      { title: 'Retry failed bank transfers', when: '3d' },
      { title: 'Move cron jobs to the queue', when: '5d' },
      { title: 'Why does the CSV export time out', when: '1w' },
    ],
  },
  { name: 'heist', from: 'Codex', open: true, chats: [{ title: 'Map the vault floor plan', when: '2d' }] },
  { name: 'scraper', from: 'OpenCode', open: true, chats: [{ title: 'Get past the login wall', when: '4d' }] },
  { name: 'dotfiles', from: 'Claude Code', chats: [] },
];

const TURNS: Record<string, Item[]> = {
  'Retry failed bank transfers': [
    { kind: 'user', text: 'Failed bank transfers just sit there. Retry them with backoff, up to five times.' },
    { kind: 'tool', verb: 'Read', target: 'src/transfers/worker.ts', meta: '121 lines' },
    { kind: 'tool', verb: 'Edit', target: 'src/transfers/worker.ts', diff: [{ op: '+', text: 'await queue.retry(job, { tries: 5, backoff: "exponential" });' }, { op: '-', text: 'log.error("transfer failed", job.id);' }] },
    { kind: 'tool', verb: 'Run', target: 'bun test transfers', meta: '12 passed', output: ['12 pass · 0 fail'] },
    { kind: 'reply', text: 'Failed transfers now go back on the queue with exponential backoff, five tries at most, and land in the dead-letter table after that.' },
  ],
  'Move cron jobs to the queue': [
    { kind: 'user', text: 'Move the nightly cron jobs onto the job queue so they survive restarts.' },
    { kind: 'tool', verb: 'Search', target: 'cron.schedule in src', meta: '4 matches' },
    { kind: 'reply', text: 'All four nightly jobs are queue jobs now, scheduled by one repeating job, so a restart mid-run picks up where it stopped.' },
  ],
  'Why does the CSV export time out': [
    { kind: 'user', text: 'The CSV export times out for big accounts. Why?' },
    { kind: 'tool', verb: 'Read', target: 'src/export/csv.ts', meta: '64 lines' },
    { kind: 'reply', text: 'It builds the whole file in memory before sending any of it. Streaming it row by row keeps the connection alive and uses a fraction of the memory.' },
  ],
  'Get past the login wall': [
    { kind: 'user', text: 'The scraper stops at the login page. Sign in with the test account first and keep the cookies.' },
    { kind: 'tool', verb: 'Edit', target: 'scraper/session.ts', diff: [{ op: '+', text: 'const jar = await signIn(env.SCRAPER_USER, env.SCRAPER_PASS);' }, { op: '+', text: 'const fetch = withCookies(jar);' }] },
    { kind: 'reply', text: 'It signs in once at the start and sends the session cookies with every request, so the pages behind the login come through now.' },
  ],
  'Map the vault floor plan': [
    { kind: 'user', text: 'Parse floorplan.svg into rooms and doors I can query.' },
    { kind: 'tool', verb: 'Read', target: 'assets/floorplan.svg', meta: '2,340 lines' },
    { kind: 'reply', text: 'rooms.ts turns the SVG into 38 rooms and 51 doors, with which rooms each door connects, so you can ask for a path between any two.' },
  ],
};

/** The app's first-run import: pick where to bring chats from, then open one. */
export function ImportDemo() {
  const [picked, setPicked] = useState<Record<string, boolean>>({ claude: true, codex: true, opencode: true });
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState('Retry failed bank transfers');
  const turn = useTurn(TURNS[open]);
  const [composer, setComposer] = useState<Composer>({ model: MODELS[0], effort: 'Default', ask: false });

  useEffect(() => {
    if (progress === null || done) return;
    if (progress >= 1) {
      const t = setTimeout(() => {
        // Open the newest chat that came over.
        const first = IMPORTED.find((p) => SOURCES.some((s) => picked[s.id] && s.name === p.from) && p.chats.length)?.chats[0].title;
        if (first) {
          setOpen(first);
          turn.reset(TURNS[first] ?? []);
        }
        setDone(true);
      }, 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setProgress((p) => Math.min(1, (p ?? 0) + 0.06 + Math.random() * 0.05)), 70);
    return () => clearTimeout(t);
  }, [progress, done, picked, turn.reset]);

  const sources = SOURCES.filter((s) => picked[s.id]);
  const total = sources.reduce((n, s) => n + s.chats, 0);

  if (!done) {
    return (
      <div className="relative flex h-full flex-col">
        <TrafficLights />
        <div data-drag className="h-[38px] shrink-0" />
        <div className="mx-auto mt-6 w-full max-w-[460px] px-6">
          <div className="flex gap-1.5">
            <span className="h-[3px] w-6 rounded-full bg-app-text" />
            <span className="h-[3px] w-6 rounded-full bg-app-line-strong" />
          </div>
          <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-[11px] border border-app-line bg-white shadow-sm">
            <Eye className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.02em]">Bring your chats along</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-app-muted">
            caveira can copy the chats and projects other coding agents left on this Mac, so you can carry on with them here. The originals stay where they are.
          </p>
          <div className="mt-6 space-y-2" data-no-drag>
            {SOURCES.map((s) => {
              const on = picked[s.id];
              const share = progress === null || !on ? 0 : Math.min(1, progress * (1.25 - SOURCES.indexOf(s) * 0.12));
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={progress !== null}
                  onClick={() => setPicked({ ...picked, [s.id]: !on })}
                  className="relative flex w-full items-center gap-3 overflow-hidden rounded-[12px] border border-app-line bg-app-surface px-3.5 py-2.5 text-left transition hover:border-app-line-strong"
                >
                  <span className="absolute inset-y-0 left-0 bg-black/[0.04] transition-[width] duration-75" style={{ width: `${share * 100}%` }} />
                  <span className={`relative flex h-4 w-4 items-center justify-center rounded-[5px] border ${on ? 'border-app-text bg-app-text text-app' : 'border-app-line-strong'}`}>
                    {on && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="relative text-[12.5px] font-medium">{s.name}</span>
                  <span className="relative ml-auto text-[11px] text-app-faint">
                    {share >= 1 ? 'Imported' : `${s.projects} projects · ${s.chats} chats`}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-end gap-3" data-no-drag>
            <span className="text-[11px] text-app-faint">{progress === null ? `${total} chats` : `Importing ${Math.round(progress * total)} of ${total}…`}</span>
            <button
              type="button"
              disabled={!total || progress !== null}
              onClick={() => setProgress(0)}
              className="rounded-[10px] bg-app-text px-4 py-2 text-[12px] font-medium text-app transition hover:opacity-85 disabled:opacity-40"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    );
  }

  const projects = IMPORTED.filter((p) => sources.some((s) => s.name === p.from));
  const openChat = (_: string, chat: string) => {
    setOpen(chat);
    turn.reset(TURNS[chat] ?? []);
  };

  return (
    <div className="appear flex h-full">
      <TrafficLights />
      <Sidebar projects={projects} active={open} onOpen={openChat} />
      <main className="flex min-w-0 flex-1 flex-col">
        <Header title={open} />
        <p className="text-center text-[10.5px] text-app-faint">
          Imported from {IMPORTED.find((p) => p.chats.some((c) => c.title === open))?.from ?? 'Claude Code'} · carry on below
        </p>
        <Transcript items={turn.items} working={turn.working} verb={turn.verb} seconds={turn.seconds} />
        <div className="px-10 pb-5">
          <div className="mx-auto max-w-[580px]">
            <ComposerBox state={composer} onChange={setComposer} onSend={(t) => turn.play(t, GENERIC)} busy={turn.busy} />
          </div>
        </div>
      </main>
    </div>
  );
}
