import { after } from 'next/server';

import { planOf, requestViewer } from '@/lib/auth';
import { apiError, appUrl } from '@/lib/http';
import { modelById, PLANS } from '@/lib/plans';
import { limitMicros, record, resetDay, usedMicros } from '@/lib/usage';

// One reply can stream for minutes. 300 seconds is the most Vercel's Hobby
// plan allows; on Pro this can go up to 800.
export const maxDuration = 300;

const UPSTREAM = (process.env.ABLITERATION_BASE_URL || 'https://api.abliteration.ai/v1').replace(/\/+$/, '');

// The OpenAI-compatible chat endpoint the clients talk to once signed in.
// It checks the account's plan and this month's usage, sends the request on
// to abliteration.ai with caveira's key, streams the reply back untouched,
// and records what it cost.
export async function POST(req: Request) {
  const viewer = await requestViewer(req);
  if (!viewer) {
    return apiError(401, 'unauthorized', 'Your caveira sign-in has expired or was revoked. Sign in again with /login.');
  }
  const key = process.env.ABLITERATION_API_KEY;
  if (!key) return apiError(503, 'unavailable', 'caveira can’t reach its models right now. Try again soon.');

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return apiError(400, 'bad_request', 'The request body is not JSON.');
  }
  const model = modelById(body.model);
  if (!model) return apiError(404, 'model_not_found', `caveira doesn’t offer ${String(body.model)}.`);

  const site = appUrl(req);
  const plan = planOf(viewer.subscription);
  if (model.large && !plan.large) {
    const cheapest = PLANS.find((p) => p.large)!;
    return apiError(403, 'plan_required', `${model.name} comes with ${cheapest.name} and up. Upgrade at ${site}/pricing`);
  }
  if ((await usedMicros(viewer.user.id)) >= limitMicros(plan)) {
    const more = plan.id === 'champion' ? '' : `, or get more at ${site}/pricing`;
    return apiError(402, 'usage_limit', `You’ve used this month’s usage on ${plan.name}. It resets ${resetDay()}${more}.`);
  }

  const stream = body.stream === true;
  if (stream) body.stream_options = { ...(body.stream_options as object | undefined), include_usage: true };

  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Accept: stream ? 'text/event-stream' : 'application/json',
  };
  const session = req.headers.get('x-abliteration-session-id');
  if (session) headers['x-abliteration-session-id'] = session;

  const sent = JSON.stringify(body);
  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/chat/completions`, { method: 'POST', headers, body: sent, signal: req.signal });
  } catch {
    return apiError(502, 'upstream_unreachable', 'caveira couldn’t reach its models. Try again in a moment.');
  }
  if (!upstream.ok) return upstreamError(upstream);

  const meter = new Meter(sent.length);
  after(() =>
    record(viewer.user.id, model, meter.result()).catch((e) => console.error('usage record', e)),
  );

  if (!stream) {
    const text = await upstream.text();
    meter.json(text);
    return new Response(text, { status: upstream.status, headers: { 'Content-Type': 'application/json' } });
  }

  const reader = upstream.body!.getReader();
  const out = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      meter.sse(value);
      controller.enqueue(value);
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
  return new Response(out, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' },
  });
}

// upstreamError passes abliteration.ai's error on, except the ones about
// caveira's own key, which mean nothing to the person asking.
async function upstreamError(res: Response): Promise<Response> {
  const text = await res.text().catch(() => '');
  if (res.status === 401 || res.status === 403 || res.status === 402) {
    console.error('upstream refused caveira', res.status, text.slice(0, 300));
    return apiError(502, 'upstream_refused', 'caveira’s model provider turned the request down. Try again soon.');
  }
  return new Response(text || JSON.stringify({ error: { message: `HTTP ${res.status}` } }), {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  });
}

type Usage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  prompt_tokens_details?: { cached_tokens?: number } | null;
};

// Meter reads the usage report off the reply as it passes. A reply cut off
// before its report (the client went away) is counted from what was sent
// and streamed, at about four characters a token.
class Meter {
  private usage: Usage | null = null;
  private chars = 0;
  private buf = '';
  private decoder = new TextDecoder();

  constructor(private sentChars: number) {}

  json(text: string) {
    try {
      this.usage = (JSON.parse(text) as { usage?: Usage }).usage ?? null;
    } catch {}
    this.chars += text.length;
  }

  sse(chunk: Uint8Array) {
    this.buf += this.decoder.decode(chunk, { stream: true });
    const lines = this.buf.split('\n');
    this.buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') continue;
      if (data.includes('"usage"')) {
        try {
          const u = (JSON.parse(data) as { usage?: Usage | null }).usage;
          if (u) this.usage = u;
        } catch {}
      }
      this.chars += deltaChars(data);
    }
  }

  result() {
    const u = this.usage;
    if (u && (u.prompt_tokens || u.completion_tokens)) {
      return {
        input: u.prompt_tokens ?? 0,
        cached: u.prompt_tokens_details?.cached_tokens ?? 0,
        output: u.completion_tokens ?? 0,
        estimated: false,
      };
    }
    return { input: Math.ceil(this.sentChars / 4), cached: 0, output: Math.ceil(this.chars / 4), estimated: true };
  }
}

// deltaChars is how much text a stream frame carried: its content,
// reasoning, and tool call arguments.
function deltaChars(data: string): number {
  try {
    const d = (JSON.parse(data) as { choices?: { delta?: Record<string, unknown> }[] }).choices?.[0]?.delta;
    if (!d) return 0;
    let n = 0;
    for (const k of ['content', 'reasoning_content', 'reasoning']) if (typeof d[k] === 'string') n += (d[k] as string).length;
    const calls = d.tool_calls as { function?: { arguments?: string } }[] | undefined;
    for (const c of calls ?? []) n += c.function?.arguments?.length ?? 0;
    return n;
  } catch {
    return 0;
  }
}
