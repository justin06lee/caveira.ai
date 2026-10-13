// Small helpers every route shares.

export function json(body: unknown, status = 200, headers?: HeadersInit): Response {
  return Response.json(body, { status, headers });
}

// An error in the OpenAI shape the clients already parse. type "caveira"
// tells them the message is ours and already says what to do.
export function apiError(status: number, code: string, message: string): Response {
  return json({ error: { message, type: 'caveira', code } }, status);
}

// Where this deployment answers: APP_URL, or the request's own origin.
export function appUrl(req?: Request): string {
  const env = process.env.APP_URL?.replace(/\/+$/, '');
  if (env) return env;
  if (req) {
    const h = req.headers;
    const host = h.get('x-forwarded-host') ?? h.get('host');
    if (host) return `${h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')}://${host}`;
    return new URL(req.url).origin;
  }
  return 'http://localhost:3000';
}

// sameOrigin keeps another site from posting to a cookie-authenticated
// route on the visitor's behalf: browsers always send Origin on POST.
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    const o = new URL(origin);
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
    return o.host === host || o.origin === appUrl();
  } catch {
    return false;
  }
}

export async function readJSON<T>(req: Request): Promise<Partial<T> | null> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? (body as Partial<T>) : null;
  } catch {
    return null;
  }
}

// safeNext keeps ?next= on this site: a path, never another origin.
export function safeNext(next: string | null | undefined, fallback = '/account'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}
