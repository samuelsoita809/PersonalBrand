import { pgTable, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    bio: text('bio'),
    socials: jsonb('socials'),
    version: varchar('version', { length: 50 }),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const analytics_events = pgTable('analytics_events', {
    id: varchar('id', { length: 255 }).primaryKey(),
    event_name: varchar('event_name', { length: 255 }).notNull(),
    metadata: jsonb('metadata'),
    context: varchar('context', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow(),
});


