import { db } from './db.js';
import { createLogger } from '@monorepo/shared';
import * as schema from '../db/schema.js';

const logger = createLogger('AnalyticsService');

/**
 * Analytics Service
 * Records events to the 'analytics_events' table.
 */
class AnalyticsService {
    /**
     * Records a significant business event
     * @param {string} eventName 
     * @param {Object} metadata 
     * @param {string} context - 'frontend' or 'backend'
     */
    async track(eventName, metadata = {}, context = 'backend') {
        try {
            logger.info(`Tracking event: ${eventName}`, { context, ...metadata });
            
            // This assumes the analytics_events table exists in the schema
            // If not yet in schema.ts, we use the raw SQL migration we created
            await db.db.insert(schema.analytics_events).values({
                event_name: eventName,
                metadata: metadata,
                context: context,
                created_at: new Date()
            });
        } catch (error) {
            logger.error(`Failed to track event: ${eventName}`, error);
        }
    }
}

export const analytics = new AnalyticsService();
