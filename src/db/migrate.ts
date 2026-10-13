// Applies drizzle/ to the database: local.db, or Turso when
// TURSO_DATABASE_URL is set.
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
console.log(`migrated ${url.startsWith('file:') ? url.slice(5) : new URL(url).host}`);
client.close();
