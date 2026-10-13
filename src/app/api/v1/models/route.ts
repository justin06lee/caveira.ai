import { requestViewer } from '@/lib/auth';
import { apiError, json } from '@/lib/http';
import { MODELS } from '@/lib/plans';

// The models caveira offers, in the shape the clients read from
// abliteration.ai's own /models.
export async function GET(req: Request) {
  if (!(await requestViewer(req))) {
    return apiError(401, 'unauthorized', 'Your caveira sign-in has expired or was revoked. Sign in again with /login.');
  }
  const perToken = (usd: number) => (usd / 1_000_000).toFixed(9);
  return json({
    object: 'list',
    data: MODELS.map((m) => ({
      id: m.id,
      object: 'model',
      owned_by: 'caveira',
      name: m.name,
      context_length: m.context,
      pricing: { prompt: perToken(m.input), completion: perToken(m.output), input_cache_read: perToken(m.cached) },
    })),
  });
}
