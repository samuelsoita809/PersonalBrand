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

    /**
     * Aggregates page view statistics with filtering
     * @param {number} days - Date range in days
     * @param {string} pageFilter - Filter by page name/URL
     * @param {string} deviceFilter - Filter by device type
     */
    async getPageViewsStats(days = 7, pageFilter = null, deviceFilter = null) {
        try {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);

            // Fetch all page_view events within range
            // In a production app, we would use SQL aggregations for performance
            const allEvents = await db.db.select().from(schema.analytics_events);
            
            const pageViews = allEvents.filter(e => 
                e.event_name === 'page_view' && 
                e.createdAt && e.createdAt >= cutoff
            );

            // Apply filters on metadata
            const filtered = pageViews.filter(e => {
                const meta = e.metadata || {};
                const matchesPage = !pageFilter || meta.page_name === pageFilter || meta.url?.includes(pageFilter);
                const matchesDevice = !deviceFilter || meta.device_type === deviceFilter;
                return matchesPage && matchesDevice;
            });

            // Calculate KPIs
            const totalViews = filtered.length;
            const uniqueSessions = new Set(filtered.map(e => e.metadata?.session_id).filter(Boolean));
            const uniqueViews = uniqueSessions.size;

            // Group by Page
            const pageMap = {};
            filtered.forEach(e => {
                const name = e.metadata?.page_name || e.metadata?.url || 'Unknown';
                pageMap[name] = (pageMap[name] || 0) + 1;
            });
            const topPages = Object.entries(pageMap)
                .map(([name, views]) => ({ name, views }))
                .sort((a, b) => b.views - a.views)
                .slice(0, 10);

            // Group by Device
            const deviceMap = {};
            filtered.forEach(e => {
                const device = e.metadata?.device_type || 'Desktop'; // Default
                deviceMap[device] = (deviceMap[device] || 0) + 1;
            });
            const devices = Object.entries(deviceMap).map(([name, value]) => ({ name, value }));

            // Time Series (Trends)
            const grouped = {};
            for (let i = 0; i < days; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                grouped[dateStr] = { date: dateStr, views: 0, unique: 0 };
            }

            const uniquePerDay = {}; // date -> Set(session_id)

            filtered.forEach(e => {
                const dateStr = e.createdAt.toISOString().split('T')[0];
                if (grouped[dateStr]) {
                    grouped[dateStr].views++;
                    
                    if (!uniquePerDay[dateStr]) uniquePerDay[dateStr] = new Set();
                    if (e.metadata?.session_id) {
                        uniquePerDay[dateStr].add(e.metadata.session_id);
                    }
                }
            });

            Object.keys(grouped).forEach(dateStr => {
                grouped[dateStr].unique = uniquePerDay[dateStr]?.size || 0;
            });

            const trends = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));

            return {
                totalViews,
                uniqueViews,
                topPages,
                devices,
                trends,
                isReal: true
            };
        } catch (error) {
            logger.error('Failed to get page view stats:', error);
            return {
                totalViews: 0,
                uniqueViews: 0,
                topPages: [],
                devices: [],
                trends: [],
                isReal: false,
                error: error.message
            };
        }
    }
}

export const analytics = new AnalyticsService();
