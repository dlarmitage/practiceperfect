import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let _db: NeonHttpDatabase<typeof schema> | null = null;

// Lazy database connection - only connects when first used
export function getDb() {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const sql = neon(dbUrl);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Re-export as db for convenience (calls getDb on first access)
export const db = {
  select: (...args: Parameters<NeonHttpDatabase<typeof schema>['select']>) => getDb().select(...args),
  insert: (...args: Parameters<NeonHttpDatabase<typeof schema>['insert']>) => getDb().insert(...args),
  update: (...args: Parameters<NeonHttpDatabase<typeof schema>['update']>) => getDb().update(...args),
  delete: (...args: Parameters<NeonHttpDatabase<typeof schema>['delete']>) => getDb().delete(...args),
};
