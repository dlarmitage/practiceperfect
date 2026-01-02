import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Create database connection on demand
function createDb() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const sql = neon(dbUrl);
  return drizzle(sql, { schema });
}

// Export a lazy getter that creates db on first access
export const db = createDb();
