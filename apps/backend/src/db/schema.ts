import { mysqlTable, varchar, text, timestamp, json } from 'drizzle-orm/mysql-core';

export const profiles = mysqlTable('profiles', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    bio: text('bio'),
    socials: json('socials'),
    version: varchar('version', { length: 50 }),
    updatedAt: timestamp('updated_at').onUpdateNow(),
});
