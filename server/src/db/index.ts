import { Pool } from 'pg';
import { newDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;
let memDbInstance: any = null;
let isUsingPgMem = false;

// Read schema and seed SQL files
const schemaSqlPath = path.join(__dirname, '../../../database/schema.sql');
const seedSqlPath = path.join(__dirname, '../../../database/seed.sql');

const schemaSql = fs.existsSync(schemaSqlPath) ? fs.readFileSync(schemaSqlPath, 'utf8') : '';
const seedSql = fs.existsSync(seedSqlPath) ? fs.readFileSync(seedSqlPath, 'utf8') : '';

export const initDatabase = async () => {
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432');
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'postgres';
  const database = process.env.PGDATABASE || 'lifelink_db';

  console.log(`[DB] Attempting PostgreSQL connection to ${user}@${host}:${port}/${database}...`);

  try {
    const testPool = new Pool({
      host,
      port,
      user,
      password,
      database,
      connectionTimeoutMillis: 2000,
    });

    const client = await testPool.connect();
    console.log('✅ [DB] Connected successfully to native PostgreSQL database!');
    client.release();
    pool = testPool;

    // Check if tables exist, if not, execute schema and seed
    const checkRes = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'donor'
      );
    `);

    if (!checkRes.rows[0].exists) {
      console.log('⚡ [DB] First-time setup detected. Applying PostgreSQL schema & seed data...');
      if (schemaSql) await pool.query(schemaSql);
      if (seedSql) await pool.query(seedSql);
      console.log('✅ [DB] Schema & seed data populated successfully into PostgreSQL!');
    }
  } catch (err: any) {
    console.warn(`⚠️ [DB] Native PostgreSQL connection failed (${err.message}).`);
    console.log('⚡ [DB] Initializing embedded in-memory PostgreSQL engine (pg-mem) for seamless demo execution...');

    try {
      const db = newDb();
      // Register custom functions if needed
      db.public.registerFunction({
        name: 'to_char',
        args: [db.public.getType('date' as any), db.public.getType('text' as any)],
        returns: db.public.getType('text' as any),
        implementation: (date: string, fmt: string) => {
          if (!date) return '';
          const d = new Date(date);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          return `${yyyy}-${mm}`;
        }
      });

      memDbInstance = db.public;
      
      // Clean schemaSql for pg-mem compatibility
      const cleanSchema = schemaSql
        .replace(/DROP VIEW IF EXISTS[\s\S]*?;/gi, '')
        .replace(/CREATE OR REPLACE VIEW[\s\S]*?;/gi, '')
        .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP');

      db.public.none(cleanSchema);
      db.public.none(seedSql);

      isUsingPgMem = true;
      console.log('✅ [DB] Embedded PostgreSQL engine (pg-mem) initialized and seeded successfully!');
    } catch (memErr: any) {
      console.error('❌ [DB] Failed to initialize embedded Postgres:', memErr);
    }
  }
};

/**
 * Execute parameterized raw SQL query
 */
export const query = async (text: string, params: any[] = []) => {
  if (pool) {
    const res = await pool.query(text, params);
    return res;
  } else if (memDbInstance) {
    const res = await memDbInstance.query(text, params);
    return res;
  } else {
    throw new Error('Database connection not initialized');
  }
};

/**
 * Execute a transaction block
 */
export const executeTransaction = async (callback: (queryFn: typeof query) => Promise<any>) => {
  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const transactionQuery = (text: string, params: any[] = []) => client.query(text, params);
      const result = await callback(transactionQuery as any);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    // pg-mem handling
    await query('BEGIN');
    try {
      const result = await callback(query);
      await query('COMMIT');
      return result;
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }
};

export const getDbStatus = () => {
  return {
    isUsingPgMem,
    status: pool ? 'Connected to PostgreSQL Server' : 'Running on Embedded PostgreSQL Engine (pg-mem)'
  };
};
