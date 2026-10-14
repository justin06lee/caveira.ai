'use client';

// The pieces of the caveira desktop app, redrawn for the site's replica
// windows: the same palette, type and layout as desktop/frontend, at the
// app's own sizes. Nothing here talks to a model; turns are scripted.

import {
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  FilePen,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Gauge,
  PanelLeft,
  Search,
  ShieldCheck,
  ShieldOff,
  SlidersHorizontal,
  SquareTerminal,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { Eye } from '@/components/Eye';

// ─── chrome ───

export function TrafficLights() {
  return (
    <div className="pointer-events-none absolute left-[14px] top-[13px] z-30 flex gap-2" aria-hidden>
      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
    </div>
  );
}

export type Project = { name: string; open?: boolean; chats: { title: string; when: string }[] };

/** The app's sidebar: projects as folders with their chats inside. */
export function Sidebar({ projects, active, onOpen }: { projects: Project[]; active?: string; onOpen?: (project: string, chat: string) => void }) {
  return (
    <aside className="relative flex w-[200px] shrink-0 flex-col border-r border-app-line bg-app-side">
      <div data-drag className="flex h-[38px] shrink-0 items-center justify-end pl-[78px] pr-3">
        <span className="mr-auto flex items-center gap-1.5 text-[13px] font-semibold tracking-tight">
          <Eye className="h-[13px] w-[13px]" />
          caveira
        </span>
        <PanelLeft size={14} className="text-app-muted" />
      </div>
      <div className="mx-2 mt-1 flex items-center gap-2 rounded-[8px] px-2 py-1.5 text-[12px] text-app-muted">
        <FolderPlus size={13} />
        <span className="flex-1">New project</span>
        <span className="text-[10.5px] text-app-faint">⌘O</span>
      </div>
      <p className="mt-4 px-4 text-[9.5px] font-semibold tracking-[0.08em] text-app-faint">PROJECTS</p>
      <div className="no-scrollbar mt-1.5 flex-1 overflow-auto px-2 pb-2">
        {projects.map((p) => (
          <div key={p.name} className="mb-0.5">
            <div className="flex items-center gap-1.5 rounded-[8px] px-1.5 py-[5px] text-[12.5px]">
              {p.open ? <ChevronDown size={11} className="text-app-faint" /> : <ChevronRight size={11} className="text-app-faint" />}
              {p.open ? <FolderOpen size={13} className="text-app-muted" /> : <Folder size={13} className="text-app-muted" />}
              <span className={p.open ? 'font-medium' : 'text-app-muted'}>{p.name}</span>
            </div>
            {p.open && (
              <div className="ml-[13px] border-l border-app-line pl-1.5">
                {p.chats.map((c) => {
                  const on = c.title === active;
                  return (
                    <button
                      key={c.title}
                      type="button"
                      onClick={() => onOpen?.(p.name, c.title)}
                      className={`flex w-full items-center gap-2 rounded-[8px] px-2 py-[5px] text-left text-[12px] transition ${on ? 'bg-black/[0.07] text-app-text' : 'text-app-muted hover:bg-black/[0.04]'}`}
                    >
                      <span className="min-w-0 flex-1 truncate">{c.title}</span>
                      <span className="shrink-0 text-[10px] text-app-faint">{c.when}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-app-line px-4 py-3 text-[12px] text-app-muted">
        <SlidersHorizontal size={13} /> Settings
      </div>
    </aside>
  );
}

/** The main pane's title bar, which also drags the window. */
export function Header({ title }: { title: string }) {
  return (
    <div data-drag className="flex h-[38px] shrink-0 items-center justify-center px-6 text-[11.5px] text-app-muted">
      <span className="truncate">{title}</span>
    </div>
  );
}

// ─── the skull and the makers' marks ───

const SKULL = [
  '..#######..',
  '.##aaaab##.',
  '##aaaaabc##',
  '#aaaaabbcd#',
  '#aaaabbbcd#',
  '###aab##bd#',
  '###a#b##bd#',
  '#aaaabbbcd#',
  '##aaaab####',
  '.#a#a#b###.',
  '.########..',
];

function hash(x: number, y: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return (h & 0xffff) / 0xffff;
}

const SHADE: Record<string, string> = { '#': 'o', a: 'f1', b: 'f2', c: 'f3', d: 'f4' };
const DOTS = SKULL.flatMap((row, y) =>
  [...row].flatMap((c, x) => (c === '.' ? [] : [{ x, y, shade: SHADE[c], delay: hash(x * 7 + 3, y * 13 + 5) * 0.9 }])),
);

/** The terminal's pixel skull as dots, dissolving in and out: caveira thinking. */
export function SkullLoader({ size = 18 }: { size?: number }) {
  return (
    <svg className="skull block shrink-0 overflow-visible" width={size} height={size} viewBox="0 0 11 11" aria-hidden>
      {DOTS.map((d) => (
        <circle key={`${d.x},${d.y}`} className={d.shade} cx={d.x + 0.5} cy={d.y + 0.5} r={0.38} style={{ animationDelay: `${d.delay.toFixed(3)}s` }} />
      ))}
    </svg>
  );
}

function Abliteration({ h }: { h: number }) {
  return (
    <svg width={(h * 371.358) / 333.122} height={h} viewBox="0 0 371.358 333.122" fill="currentColor" aria-label="abliteration.ai">
      <path d="M51.48 0H0V333.122H51.48V0Z" />
      <path d="M371.358 0H316.415L186.498 314.964L179.337 333.122H233.111L363.402 19.3752L371.358 0Z" />
      <path d="M189.4 0H137.78L90.9328 325.822L89.8096 333.122H141.243L186.779 17.2224L189.4 0Z" />
    </svg>
  );
}

function Zai({ h }: { h: number }) {
  return (
    <svg width={(h * 18.6) / 15.82} height={h} viewBox="5.7 7.09 18.6 15.82" fill="currentColor" aria-label="Z.ai">
      <path d="M15.47,7.1l-1.3,1.85c-0.2,0.29-0.54,0.47-0.9,0.47h-7.1V7.09C6.16,7.1,15.47,7.1,15.47,7.1z" />
      <polygon points="24.3,7.1 13.14,22.91 5.7,22.91 16.86,7.1" />
      <path d="M14.53,22.91l1.31-1.86c0.2-0.29,0.54-0.47,0.9-0.47h7.09v2.33H14.53z" />
    </svg>
  );
}

function Qwen({ h }: { h: number }) {
  return (
    <svg width={h * 1.1} height={h * 1.1} viewBox="1 1 22 22" fill="currentColor" aria-label="Qwen">
      <path
        fillRule="evenodd"
        d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z"
      />
    </svg>
  );
}

export type Model = { id: string; name: string; maker: 'qwen' | 'zai'; context: string };

export const MODELS: Model[] = [
  { id: 'abliterated-model', name: 'Qwen3.5', maker: 'qwen', context: '256K' },
  { id: 'abliterated-model-large', name: 'GLM-5.2', maker: 'zai', context: '1M' },
  { id: 'abliterated-model-large-v2', name: 'GLM-5.3', maker: 'zai', context: '1M' },
];

export function Logos({ maker, h = 11 }: { maker: Model['maker']; h?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-[3px]">
      <Abliteration h={h} />
      <span className="text-[9px] text-app-faint">×</span>
      {maker === 'qwen' ? <Qwen h={h} /> : <Zai h={h} />}
    </span>
  );
}

// ─── the transcript ───

export type DiffLine = { op: ' ' | '+' | '-'; text: string };

export type Item =
  | { kind: 'user'; text: string }
  | { kind: 'thought'; text: string }
  | { kind: 'tool'; verb: 'Read' | 'Edit' | 'Run' | 'Search'; target: string; meta?: string; diff?: DiffLine[]; output?: string[] }
  | { kind: 'reply'; text: string }
  | { kind: 'stats'; text: string }
  | { kind: 'approval'; command: string; answer?: 'denied' };

const TOOL_ICON = { Read: FileText, Edit: FilePen, Run: SquareTerminal, Search: Search } as const;

function Tool({ item }: { item: Extract<Item, { kind: 'tool' }> }) {
  const [open, setOpen] = useState(false);
  const Icon = TOOL_ICON[item.verb];
  const body = item.diff || item.output;
  return (
    <div className="appear">
      <button
        type="button"
        onClick={() => body && setOpen(!open)}
        className="group flex w-full items-center gap-2 rounded-[8px] py-1 text-left text-[12px]"
      >
        <Icon size={13} className="shrink-0 text-app-muted" />
        <span className="font-medium">{item.verb}</span>
        <span className="min-w-0 truncate font-mono text-[11px] text-app-muted">{item.target}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[10.5px] text-app-faint">
          {item.diff ? <DiffCount diff={item.diff} /> : item.meta}
          {body && <ChevronRight size={12} className={`transition ${open ? 'rotate-90' : ''}`} />}
        </span>
      </button>
      {open && body && (
        <div className="appear no-scrollbar my-1 overflow-x-auto rounded-[10px] border border-app-line bg-app-surface py-1.5 font-mono text-[10.5px] leading-[1.6]">
          {item.diff?.map((l, i) => (
            <div key={i} className={`whitespace-pre px-3 ${l.op === '+' ? 'bg-[rgba(77,122,83,0.1)] text-app-green' : l.op === '-' ? 'bg-[rgba(176,71,61,0.09)] text-app-red' : 'text-app-muted'}`}>
              {l.op} {l.text}
            </div>
          ))}
          {item.output?.map((l, i) => (
            <div key={i} className="whitespace-pre px-3 text-app-muted">
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DiffCount({ diff }: { diff: DiffLine[] }) {
  const add = diff.filter((l) => l.op === '+').length;
  const del = diff.filter((l) => l.op === '-').length;
  return (
    <span className="font-mono">
      <span className="text-app-green">+{add}</span> <span className="text-app-red">−{del}</span>
    </span>
  );
}

function Approval({ item, onAnswer }: { item: Extract<Item, { kind: 'approval' }>; onAnswer?: (allow: boolean) => void }) {
  if (item.answer) {
    return (
      <div className="appear flex items-center gap-2 py-1 text-[12px]">
        <SquareTerminal size={13} className="text-app-muted" />
        <span className="font-mono text-[11px] text-app-muted">{item.command}</span>
        <span className="ml-auto text-[10.5px] text-app-red">Denied</span>
      </div>
    );
  }
  return (
    <div className="appear my-1 rounded-[12px] border border-[rgba(148,111,31,0.35)] bg-app-surface p-3.5" data-no-drag>
      <p className="text-[11.5px] font-medium text-app-amber">Run this command?</p>
      <p className="mt-2 rounded-[8px] bg-app-sunken px-2.5 py-1.5 font-mono text-[11px]">{item.command}</p>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={() => onAnswer?.(false)} className="rounded-full px-3.5 py-1.5 text-[11.5px] text-app-muted transition hover:bg-black/[0.05]">
          Deny
        </button>
        <button type="button" onClick={() => onAnswer?.(true)} className="rounded-full bg-app-text px-3.5 py-1.5 text-[11.5px] font-medium text-app transition hover:opacity-85">
          Allow
        </button>
      </div>
    </div>
  );
}

export function Transcript({ items, working, verb, seconds, onAnswer }: { items: Item[]; working: boolean; verb: string; seconds: number; onAnswer?: (allow: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items, working]);
  return (
    <div ref={ref} className="no-scrollbar flex-1 overflow-auto px-10 pb-4 pt-2">
      <div className="mx-auto max-w-[540px] space-y-2.5">
        {items.map((it, i) => {
          switch (it.kind) {
            case 'user':
              return (
                <div key={i} className="appear flex justify-end">
                  <p className="max-w-[78%] rounded-[16px] bg-app-sunken px-3.5 py-2 text-[12.5px] leading-relaxed">{it.text}</p>
                </div>
              );
            case 'thought':
              return (
                <div key={i} className="appear flex items-center gap-1.5 text-[11.5px] text-app-faint">
                  <ChevronRight size={12} /> Thought
                </div>
              );
            case 'tool':
              return <Tool key={i} item={it} />;
            case 'approval':
              return <Approval key={i} item={it} onAnswer={onAnswer} />;
            case 'reply':
              return (
                <p key={i} className="whitespace-pre-line text-[12.5px] leading-[1.65]">
                  {it.text}
                </p>
              );
            case 'stats':
              return (
                <p key={i} className="appear text-[10.5px] text-app-faint">
                  {it.text}
                </p>
              );
          }
        })}
        {working && (
          <div className="appear flex items-center gap-2.5 pt-1 text-[12px] text-app-muted">
            <SkullLoader />
            <span>{verb}…</span>
            <span className="text-[10.5px] text-app-faint">{seconds}s</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── playing a turn ───

/** A step of a scripted turn: an item after a pause, or an approval to wait on. */
export type Step = { wait: number; item: Item };

const VERBS = ['Casing the joint', 'Slipping past the guards', 'Reading the plans', 'Laying low', 'Cutting the wires', 'Covering tracks', 'Going dark', 'Planning the heist'];

/**
 * useTurn plays scripted turns into a transcript: items arrive on their
 * pauses, replies stream in, and the skull thinks in between. A command
 * that needs approval waits for Allow or Deny.
 */
export function useTurn(initial: Item[] = []) {
  const [items, setItems] = useState<Item[]>(initial);
  const [working, setWorking] = useState(false);
  const [verb, setVerb] = useState(VERBS[0]);
  const [seconds, setSeconds] = useState(0);
  const [asking, setAsking] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const waiting = useRef<((allow: boolean) => void) | null>(null);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  useEffect(() => {
    if (!working) return;
    setSeconds(0);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [working]);

  const after = (ms: number) => new Promise<void>((resolve) => timers.current.push(setTimeout(resolve, ms)));

  const play = useCallback(async (user: string, steps: Step[], ask?: { command: string; denied: Item[] }) => {
    clear();
    setItems((prev) => [...prev, { kind: 'user', text: user }]);
    setVerb(VERBS[Math.floor(Math.random() * VERBS.length)]);
    setWorking(true);
    for (const step of steps) {
      await after(step.wait);
      if (step.item.kind === 'approval' && ask) {
        setWorking(false);
        setAsking(true);
        setItems((prev) => [...prev, step.item]);
        const allow = await new Promise<boolean>((resolve) => (waiting.current = resolve));
        waiting.current = null;
        setAsking(false);
        // Allowed, the card gives way to the run itself; denied, it stays
        // as a line saying so.
        setItems((prev) => (allow ? prev.filter((it) => it !== step.item) : prev.map((it) => (it === step.item ? { ...it, answer: 'denied' as const } : it))));
        if (!allow) {
          for (const it of ask.denied) {
            await after(500);
            setItems((prev) => [...prev, it]);
          }
          return;
        }
        setWorking(true);
        continue;
      }
      if (step.item.kind === 'approval') continue;
      if (step.item.kind === 'reply') {
        setWorking(false);
        const full = step.item.text;
        setItems((prev) => [...prev, { kind: 'reply', text: '' }]);
        for (let n = 0; n < full.length; ) {
          n = Math.min(full.length, n + 3 + Math.floor(Math.random() * 4));
          const text = full.slice(0, n);
          setItems((prev) => [...prev.slice(0, -1), { kind: 'reply', text }]);
          await after(16);
        }
        continue;
      }
      setVerb(VERBS[Math.floor(Math.random() * VERBS.length)]);
      setItems((prev) => [...prev, step.item]);
    }
    setWorking(false);
  }, []);

  const answer = useCallback((allow: boolean) => waiting.current?.(allow), []);
  const reset = useCallback((to: Item[] = []) => {
    clear();
    waiting.current = null;
    setWorking(false);
    setAsking(false);
    setItems(to);
  }, []);

  return { items, working, verb, seconds, play, answer, reset, busy: working || asking };
}

// ─── the composer ───

export const EFFORTS = ['Default', 'None', 'Minimal', 'Low', 'Medium', 'High', 'Extra high', 'Max'];

type Menu = 'model' | 'effort' | 'perm' | null;

export type Composer = {
  model: Model;
  effort: string;
  ask: boolean;
};

function Chip({ onClick, open, danger, children }: { onClick: () => void; open: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-[8px] px-2 py-1 text-[11px] transition ${open ? 'bg-black/[0.07]' : 'hover:bg-black/[0.05]'} ${danger ? 'text-app-red' : 'text-app-muted'}`}
    >
      {children}
      <ChevronDown size={11} />
    </button>
  );
}

function MenuBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="appear absolute bottom-[calc(100%+6px)] left-0 z-40 min-w-[200px] rounded-[14px] border border-app-line bg-app-surface p-1.5 shadow-[0_1px_2px_rgba(28,28,26,0.04),0_8px_28px_rgba(28,28,26,0.1)]">
      <p className="px-2.5 pb-1 pt-1.5 text-[10.5px] text-app-faint">{title}</p>
      {children}
    </div>
  );
}

function MenuItem({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-1.5 text-left text-[11.5px] transition hover:bg-black/[0.05]">
      {children}
      {on && <Check size={13} className="ml-auto shrink-0" />}
    </button>
  );
}

/**
 * The message box with its model, effort and permissions chips. Enter
 * sends; Shift+Tab flips the permissions, as in the app.
 */
export function ComposerBox({
  state,
  onChange,
  onSend,
  busy,
  placeholder = 'Reply to caveira…',
  suggestion,
  autoFocus,
}: {
  state: Composer;
  onChange: (next: Composer) => void;
  onSend: (text: string) => void;
  busy: boolean;
  placeholder?: string;
  suggestion?: string;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState('');
  const [menu, setMenu] = useState<Menu>(null);
  const toggle = (m: Menu) => setMenu(menu === m ? null : m);
  const send = () => {
    const t = (text || suggestion || '').trim();
    if (!t || busy) return;
    setText('');
    setMenu(null);
    onSend(t);
  };

  return (
    <div className="relative rounded-[18px] border border-app-line bg-app-surface shadow-[0_1px_2px_rgba(28,28,26,0.04),0_8px_28px_rgba(28,28,26,0.06)]" data-no-drag>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            send();
          } else if (e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();
            onChange({ ...state, ask: !state.ask });
          }
        }}
        placeholder={suggestion ?? placeholder}
        className="w-full bg-transparent px-4 pb-1.5 pt-3.5 text-[12.5px] outline-none placeholder:text-app-faint"
      />
      <div className="flex items-center gap-1 px-2.5 pb-2.5">
        <div className="relative">
          <Chip onClick={() => toggle('model')} open={menu === 'model'}>
            <Logos maker={state.model.maker} h={10} />
            <span className="text-app-text">{state.model.name}</span>
          </Chip>
          {menu === 'model' && (
            <MenuBox title="abliteration.ai">
              {MODELS.map((m) => (
                <MenuItem
                  key={m.id}
                  on={m.id === state.model.id}
                  onClick={() => {
                    onChange({ ...state, model: m });
                    setMenu(null);
                  }}
                >
                  <span className="w-[38px]">
                    <Logos maker={m.maker} h={10} />
                  </span>
                  <span>{m.name}</span>
                  <span className="text-[10px] text-app-faint">{m.context}</span>
                </MenuItem>
              ))}
            </MenuBox>
          )}
        </div>
        <div className="relative">
          <Chip onClick={() => toggle('effort')} open={menu === 'effort'}>
            <Gauge size={12} />
            <span>{state.effort}</span>
          </Chip>
          {menu === 'effort' && (
            <MenuBox title="Reasoning effort">
              {EFFORTS.map((e) => (
                <MenuItem
                  key={e}
                  on={e === state.effort}
                  onClick={() => {
                    onChange({ ...state, effort: e });
                    setMenu(null);
                  }}
                >
                  {e}
                </MenuItem>
              ))}
            </MenuBox>
          )}
        </div>
        <div className="relative">
          <Chip onClick={() => toggle('perm')} open={menu === 'perm'} danger={!state.ask}>
            {state.ask ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
            <span>{state.ask ? 'Ask permissions' : 'Bypass permissions'}</span>
          </Chip>
          {menu === 'perm' && (
            <MenuBox title="Permissions">
              {[true, false].map((ask) => (
                <MenuItem
                  key={String(ask)}
                  on={ask === state.ask}
                  onClick={() => {
                    onChange({ ...state, ask });
                    setMenu(null);
                  }}
                >
                  {ask ? <ShieldCheck size={13} className="shrink-0 text-app-muted" /> : <ShieldOff size={13} className="shrink-0 text-app-muted" />}
                  <span>
                    {ask ? 'Ask permissions' : 'Bypass permissions'}
                    <span className="block text-[10px] text-app-faint">{ask ? 'Asks before commands and edits' : 'Runs everything without asking'}</span>
                  </span>
                </MenuItem>
              ))}
            </MenuBox>
          )}
        </div>
        <button
          type="button"
          onClick={send}
          aria-label="Send"
          className={`ml-auto flex h-7 w-7 items-center justify-center rounded-full transition ${(text || suggestion) && !busy ? 'bg-app-text text-app' : 'bg-black/[0.12] text-app'}`}
        >
          <ArrowUp size={14} />
        </button>
      </div>
    </div>
  );
}

/** A new chat: the eye, a greeting, and the project it is in. */
export function Welcome({ greeting, project }: { greeting: string; project: string }) {
  return (
    <div className="flex flex-col items-center">
      <Eye className="h-[54px] w-[54px] text-[#2a2a28]" />
      <p className="mt-5 text-[17px] font-semibold tracking-[-0.02em]">{greeting}</p>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-app-muted">
        <Folder size={11} /> {project}
      </p>
    </div>
  );
}
