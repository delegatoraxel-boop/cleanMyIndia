import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from './env.js';
import * as schema from './db/schema';

const { Pool } = pg;

// Create a connection pool
export const pool = new Pool({
    host: env.DATABASE_HOST,
    port: parseInt(env.DATABASE_PORT),
    database: env.DATABASE_NAME,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Function to test database connection
export async function testConnection(): Promise<boolean> {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✅ Database connected successfully at:', result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await pool.end();
    console.log('Database pool has ended');
    process.exit(0);
});
