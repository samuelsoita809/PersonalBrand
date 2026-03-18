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
            
            await db.db.insert(schema.analytics_events).values({
                id: crypto.randomUUID(),
                event_name: eventName,
                metadata: metadata,
                context: context,
                createdAt: new Date()
            });
        } catch (error) {
            logger.error(`Failed to track event: ${eventName}`, error);
        }
    }

    async getSummary() {
        try {
            logger.info('Fetching analytics summary stats');
            const events = await db.db.select().from(schema.analytics_events);
            const leads = await db.db.select().from(schema.hero_leads);
            
            const stats = {
                total_events: events.length,
                page_views: events.filter(e => e.event_name === 'page_view').length,
                cta_clicks: events.filter(e => e.event_name.startsWith('cta_')).length,
                modal_opens: events.filter(e => e.event_name === 'modal_open').length,
                leads: leads.length
            };

            // Calculation Rules for Product Specification
            stats.ctr = stats.page_views > 0 ? (stats.cta_clicks / stats.page_views).toFixed(4) : 0;
            stats.modal_rate = stats.cta_clicks > 0 ? (stats.modal_opens / stats.cta_clicks).toFixed(4) : 0;

            return stats;
        } catch (error) {
            logger.error('Error fetching summary:', error);
            throw error;
        }
    }
}

export const analytics = new AnalyticsService();
