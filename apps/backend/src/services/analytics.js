import { db } from './db.js';
import { createLogger } from '@monorepo/shared';
import * as schema from '../db/schema.js';
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

            return { ...stats, isReal: true };
        } catch (error) {
            logger.warn('Failed to fetch analytics from database, using empty defaults', error.message);
            // Graceful fallback to prevent 500 errors in the dashboard
            return {
                total_events: 0,
                page_views: 0,
                cta_clicks: 0,
                modal_opens: 0,
                leads: 0,
                ctr: 0,
                modal_rate: 0,
                isReal: false,
                error: error.message
            };
        }
    }

    async getTimeSeries(days = 7) {
        try {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);

            const events = await db.db.select().from(schema.analytics_events);
            const series = events.filter(e => e.createdAt && e.createdAt >= cutoff);
            
            // Group by day
            const grouped = {};
            for (let i = 0; i < days; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                grouped[dateStr] = { date: dateStr, views: 0, clicks: 0 };
            }

            series.forEach(e => {
                if (e.createdAt && typeof e.createdAt.toISOString === 'function') {
                    const dateStr = e.createdAt.toISOString().split('T')[0];
                    if (grouped[dateStr]) {
                        if (e.event_name === 'page_view') grouped[dateStr].views++;
                        if (e.event_name.startsWith('cta_')) grouped[dateStr].clicks++;
                    }
                }
            });

            return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
        } catch (error) {
            logger.warn('Failed to fetch time series, using empty dataset', error.message);
            return [];
        }
    }

    async getRecentEvents(limit = 10) {
        try {
            return await db.db.select()
                .from(schema.analytics_events)
                .orderBy(db.db.desc(schema.analytics_events.createdAt))
                .limit(limit);
        } catch (error) {
            logger.warn('Failed to fetch recent events, using empty list', error.message);
            return [];
        }
    }
}

export const analytics = new AnalyticsService();
