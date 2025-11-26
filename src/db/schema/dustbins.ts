import { pgTable, serial, numeric, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define status enum
export const statusEnum = pgEnum('dustbin_status', ['active', 'full', 'damaged', 'removed']);

// Define dustbins table
export const dustbins = pgTable('dustbins', {
  id: serial('id').primaryKey(),
  latitude: numeric('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: numeric('longitude', { precision: 11, scale: 8 }).notNull(),
  address: text('address'),
  description: text('description'),
  status: statusEnum('status').default('active').notNull(),
  reportedBy: text('reported_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type inference for insert and select
export type Dustbin = typeof dustbins.$inferSelect;
export type NewDustbin = typeof dustbins.$inferInsert;
