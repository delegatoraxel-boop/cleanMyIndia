import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  googleId: text('google_id').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  picture: text('picture'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type inference for insert and select
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
