import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Lazy initialization to prevent module-level errors
let _db: NeonHttpDatabase<typeof schema> | null = null;

export const getDb = () => {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const sql = neon(dbUrl);
    _db = drizzle(sql, { schema });
  }
  return _db;
};

// For backwards compatibility, but this will throw if accessed before env is ready
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop) {
    return getDb()[prop as keyof NeonHttpDatabase<typeof schema>];
  }
});
