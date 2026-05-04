import { pgTable, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

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

export const project_requests = pgTable('project_requests', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    project_type: varchar('project_type', { length: 255 }).notNull(),
    selected_plan: varchar('selected_plan', { length: 50 }).notNull(),
    description: text('description').notNull(),
    status: varchar('status', { length: 50 }).default('pending'),
    timestamp: timestamp('timestamp').defaultNow(),
    metadata: jsonb('metadata'),
});

export const mentor_requests = pgTable('mentor_requests', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    level: varchar('level', { length: 50 }).notNull(),
    goal: varchar('goal', { length: 255 }).notNull(),
    plan: varchar('plan', { length: 50 }).notNull(),
    description: text('description').notNull(),
    status: varchar('status', { length: 50 }).default('pending'),
    timestamp: timestamp('timestamp').defaultNow(),
    metadata: jsonb('metadata'),
});

export const coffee_requests = pgTable('coffee_requests', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    plan: varchar('plan', { length: 50 }).notNull(),
    idea: text('idea').notNull(),
    urgency: varchar('urgency', { length: 20 }).notNull(),
    status: varchar('status', { length: 50 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    metadata: jsonb('metadata'),
});

export const free_requests = pgTable('free_requests', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    service: varchar('service', { length: 255 }).notNull(),
    message: text('message').notNull(),
    status: varchar('status', { length: 50 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    metadata: jsonb('metadata'),
});

export const events = pgTable('events', {
    event_id: varchar('event_id', { length: 255 }).primaryKey(),
    cta_type: varchar('cta_type', { length: 50 }).notNull(),
    timestamp: timestamp('timestamp').defaultNow(),
    session_id: varchar('session_id', { length: 100 }).notNull(),
});

export const chat_sessions = pgTable('chat_sessions', {
    id: varchar('id', { length: 255 }).primaryKey(),
    session_id: varchar('session_id', { length: 255 }).notNull(),
    intent: varchar('intent', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const chat_leads = pgTable('chat_leads', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    intent: varchar('intent', { length: 255 }).notNull(),
    session_id: varchar('session_id', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
