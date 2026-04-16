import { db, schema } from '../apps/backend/src/services/db.js';
import { count } from 'drizzle-orm';

async function test() {
  try {
    const result = await db.db.select({
      total: count(),
    }).from(schema.page_views);
    
    console.log('Query Result:', JSON.stringify(result, null, 2));
    if (result.length > 0) {
        console.log('Result[0].total type:', typeof result[0].total);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
