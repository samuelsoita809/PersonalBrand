import { db } from './db.js';
import { createLogger } from '@monorepo/shared';
import * as schema from '../db/schema.js';
import { count, eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

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

    /**
     * Get aggregated metrics for the dashboard
     */
    async getSummary() {
        try {
            logger.info('Fetching analytics summary');

            // Total Page Views
            const pageViewsResult = await db.db
                .select({ value: count() })
                .from(schema.analytics_events)
                .where(eq(schema.analytics_events.event_name, 'page_view'));
            
            // Total CTA Clicks
            const ctaClicksResult = await db.db
                .select({ value: count() })
                .from(schema.analytics_events)
                .where(sql`${schema.analytics_events.event_name} LIKE 'cta_%'`);

            // Total Modal Opens
            const modalOpensResult = await db.db
                .select({ value: count() })
                .from(schema.analytics_events)
                .where(eq(schema.analytics_events.event_name, 'modal_open'));

            // Click Through Rate calculation (mocked/simplified for now)
            const pv = Number(pageViewsResult[0]?.value || 0);
            const cta = Number(ctaClicksResult[0]?.value || 0);
            const cr = pv > 0 ? ((cta / pv) * 100).toFixed(1) + '%' : '0%';

            return [
                { label: 'Total Page Views', value: pv.toLocaleString(), color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'CTA Clicks', value: cta.toLocaleString(), color: 'text-purple-400', bg: 'bg-purple-400/10' },
                { label: 'Modal Opens', value: Number(modalOpensResult[0]?.value || 0).toLocaleString(), color: 'text-pink-400', bg: 'bg-pink-400/10' },
                { label: 'Conversion Rate', value: cr, color: 'text-green-400', bg: 'bg-green-400/10' },
            ];
        } catch (error) {
            logger.error('Failed to fetch analytics summary:', error);
            throw error;
        }
    }
}

export const analytics = new AnalyticsService();
