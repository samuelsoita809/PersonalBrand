import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { analytics_events } from './apps/backend/src/db/schema.js';

const sql = postgres();
const db = drizzle(sql);

async function test() {
    try {
        await db.select().from(analytics_events);
    } catch(e) {
        console.error("CAUGHT ERROR:", e.message);
    } finally {
        sql.end();
    }
}
test();
