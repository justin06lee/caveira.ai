import type { Item, Step } from './kit';

// The turns the replicas play. Each is what caveira would do for the
// request: look, change, run, say what it did.

const s = (wait: number, item: Item): Step => ({ wait, item });

export type Script = { match: RegExp; title: string; steps: Step[] };

export const SUGGESTIONS = ['Add rate limiting to the API', 'Why is the login page slow?', 'Port the scraper to Go'];

export const SCRIPTS: Script[] = [
  {
    match: /rate|limit|throttl/i,
    title: 'Rate limiting',
    steps: [
      s(900, { kind: 'thought', text: '' }),
      s(700, { kind: 'tool', verb: 'Read', target: 'src/server.ts', meta: '214 lines' }),
      s(600, { kind: 'tool', verb: 'Search', target: 'app.use( in src', meta: '6 matches' }),
      s(1100, {
        kind: 'tool',
        verb: 'Edit',
        target: 'src/server.ts',
        diff: [
          { op: ' ', text: "import { serve } from './http';" },
          { op: '+', text: "import { limit } from './limit';" },
          { op: ' ', text: '' },
          { op: ' ', text: 'const app = serve();' },
          { op: '+', text: "app.use(limit({ window: '1m', max: 120 }));" },
          { op: '-', text: '// TODO: rate limiting' },
        ],
      }),
      s(900, {
        kind: 'tool',
        verb: 'Edit',
        target: 'src/limit.ts',
        diff: [
          { op: '+', text: 'export function limit({ window, max }: Limit) {' },
          { op: '+', text: '  const hits = new Map<string, number[]>();' },
          { op: '+', text: '  return (req, res, next) => {' },
          { op: '+', text: '    const now = Date.now(), ip = req.ip;' },
          { op: '+', text: '    const recent = (hits.get(ip) ?? []).filter((t) => now - t < ms(window));' },
          { op: '+', text: "    if (recent.length >= max) return res.status(429).set('Retry-After', '60').end();" },
          { op: '+', text: '    hits.set(ip, [...recent, now]);' },
          { op: '+', text: '    next();' },
          { op: '+', text: '  };' },
          { op: '+', text: '}' },
        ],
      }),
      s(1300, { kind: 'tool', verb: 'Run', target: 'bun test', meta: '34 passed', output: ['✓ limit › lets 120 through', '✓ limit › answers the 121st with 429', '…', '34 pass · 0 fail · 1.84s'] }),
      s(700, {
        kind: 'reply',
        text: 'Done. Every route now takes at most 120 requests a minute from one address; the next gets a 429 with a Retry-After header. The limiter is in src/limit.ts, with two new tests, and all 34 pass.',
      }),
      s(100, { kind: 'stats', text: '41s · 5 tools · $0.0142' }),
    ],
  },
  {
    match: /login|slow|fast|perf|speed/i,
    title: 'Slow login',
    steps: [
      s(900, { kind: 'thought', text: '' }),
      s(700, { kind: 'tool', verb: 'Read', target: 'src/routes/login.ts', meta: '88 lines' }),
      s(1200, { kind: 'tool', verb: 'Run', target: 'bun run bench login', meta: 'p50 840ms', output: ['login   p50 840ms   p95 1.91s   n=200'] }),
      s(800, { kind: 'tool', verb: 'Search', target: 'sessions.find in src', meta: '3 matches' }),
      s(1100, {
        kind: 'tool',
        verb: 'Edit',
        target: 'src/routes/login.ts',
        diff: [
          { op: '-', text: 'for (const id of user.sessionIds) {' },
          { op: '-', text: '  sessions.push(await db.sessions.find(id));' },
          { op: '-', text: '}' },
          { op: '+', text: 'const sessions = await db.sessions.findMany({ userId: user.id });' },
        ],
      }),
      s(1300, { kind: 'tool', verb: 'Run', target: 'bun run bench login', meta: 'p50 95ms', output: ['login   p50 95ms   p95 160ms   n=200'] }),
      s(700, {
        kind: 'reply',
        text: "It loaded each of the user's sessions with its own query, so login got slower with every device they'd signed in on. It's one query now: p50 went from 840 ms to 95 ms.",
      }),
      s(100, { kind: 'stats', text: '29s · 5 tools · $0.0088' }),
    ],
  },
  {
    match: /port|go\b|golang|rewrite|scrap/i,
    title: 'Scraper in Go',
    steps: [
      s(900, { kind: 'thought', text: '' }),
      s(700, { kind: 'tool', verb: 'Read', target: 'scraper/index.ts', meta: '132 lines' }),
      s(1500, {
        kind: 'tool',
        verb: 'Edit',
        target: 'scraper/main.go',
        diff: [
          { op: '+', text: 'func main() {' },
          { op: '+', text: '\tpages := make(chan string)' },
          { op: '+', text: '\tvar wg sync.WaitGroup' },
          { op: '+', text: '\tfor range 8 {' },
          { op: '+', text: '\t\twg.Go(func() { for u := range pages { fetch(u) } })' },
          { op: '+', text: '\t}' },
          { op: '+', text: '\t…' },
        ],
      }),
      s(1400, { kind: 'tool', verb: 'Run', target: 'go run ./scraper --dry-run', meta: '40 pages', output: ['fetched 40 pages in 3.2s, 0 errors'] }),
      s(700, {
        kind: 'reply',
        text: 'Ported. scraper/main.go does what index.ts did, fetching eight pages at a time on goroutines. The dry run got all 40 pages in 3.2 s, against 11 s before.',
      }),
      s(100, { kind: 'stats', text: '36s · 3 tools · $0.0117' }),
    ],
  },
];

// Anything else: look around, change it, check it.
export const GENERIC: Step[] = [
  s(900, { kind: 'thought', text: '' }),
  s(700, { kind: 'tool', verb: 'Search', target: 'the project', meta: '7 matches' }),
  s(700, { kind: 'tool', verb: 'Read', target: 'src/app.ts', meta: '176 lines' }),
  s(1200, {
    kind: 'tool',
    verb: 'Edit',
    target: 'src/app.ts',
    diff: [
      { op: ' ', text: 'export async function handle(req: Request) {' },
      { op: '-', text: '  return legacy(req);' },
      { op: '+', text: '  const input = await parse(req);' },
      { op: '+', text: '  return respond(await run(input));' },
      { op: ' ', text: '}' },
    ],
  }),
  s(1200, { kind: 'tool', verb: 'Run', target: 'bun test', meta: '33 passed', output: ['33 pass · 0 fail · 1.62s'] }),
  s(700, { kind: 'reply', text: 'Done. The change is in src/app.ts, with a test for it, and all 33 pass. Say the word and I’ll walk you through the diff.' }),
  s(100, { kind: 'stats', text: '24s · 4 tools · $0.0064' }),
];

export function scriptFor(text: string): { title: string; steps: Step[] } {
  const hit = SCRIPTS.find((sc) => sc.match.test(text));
  if (hit) return hit;
  const words = text.replace(/[^\w\s'-]/g, '').split(/\s+/).filter(Boolean).slice(0, 5).join(' ');
  return { title: words.charAt(0).toUpperCase() + words.slice(1), steps: GENERIC };
}
