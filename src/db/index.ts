import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from './schema';

export type DB = ReturnType<typeof open>;

function open() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
    throw new Error('TURSO_DATABASE_URL is not set');
  }
  const client = createClient({ url: url || 'file:local.db', authToken: process.env.TURSO_AUTH_TOKEN });
  return drizzle(client, { schema });
}

let cached: DB | undefined;

// Opened on first use rather than on import, so building the site needs no
// database.
export function db(): DB {
  cached ??= open();
  return cached;
}
