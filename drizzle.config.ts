import { defineConfig } from 'drizzle-kit';
import { env } from './src/env';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: env.DATABASE_HOST,
    port: parseInt(env.DATABASE_PORT),
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    ssl: false,
  },
});
