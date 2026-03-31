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
});export const hero_leads = pgTable('hero_leads', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    message: text('message'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const page_views = pgTable('page_views', {
    id: varchar('id', { length: 255 }).primaryKey(),
    page_url: text('page_url').notNull(),
    page_path: varchar('page_path', { length: 255 }).notNull(),
    session_id: varchar('session_id', { length: 255 }).notNull(),
    user_id: varchar('user_id', { length: 255 }),
    device_type: varchar('device_type', { length: 50 }),
    timestamp: timestamp('timestamp').defaultNow(),
    metadata: jsonb('metadata'),
});

export const cta_clicks = pgTable('cta_clicks', {
    id: varchar('id', { length: 255 }).primaryKey(),
    cta_name: varchar('cta_name', { length: 255 }).notNull(),
    cta_id: varchar('cta_id', { length: 255 }).notNull(),
    page_path: varchar('page_path', { length: 255 }).notNull(),
    session_id: varchar('session_id', { length: 255 }).notNull(),
    device_type: varchar('device_type', { length: 50 }),
    timestamp: timestamp('timestamp').defaultNow(),
    metadata: jsonb('metadata'),
});
