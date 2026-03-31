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

    /**
     * Records a page view to the dedicated 'page_views' table.
     * @param {Object} data 
     */
    async trackPageView(data) {
        try {
            logger.info(`Tracking page view: ${data.url}`, { sid: data.session_id });
            
            await db.db.insert(schema.page_views).values({
                id: crypto.randomUUID(),
                page_url: data.url,
                page_path: data.path,
                session_id: data.session_id,
                user_id: data.user_id,
                device_type: data.device_type,
                timestamp: new Date(),
                metadata: data.metadata
            });
        } catch (error) {
            logger.error('Failed to track page view:', error);
        }
    }

    /**
     * Records a CTA click to the dedicated 'cta_clicks' table.
     * @param {Object} data 
     */
    async trackCtaClick(data) {
        try {
            logger.info(`Tracking CTA click: ${data.cta_name}`, { sid: data.session_id });
            
            await db.db.insert(schema.cta_clicks).values({
                id: crypto.randomUUID(),
                cta_name: data.cta_name,
                cta_id: data.cta_id,
                page_path: data.page_path,
                session_id: data.session_id,
                device_type: data.device_type,
                timestamp: new Date(),
                metadata: data.metadata || {}
            });
        } catch (error) {
            logger.error('Failed to track CTA click:', error);
        }
    }

    async getSummary() {
        try {
            logger.info('Fetching analytics summary stats');
            const events = await db.db.select().from(schema.analytics_events);
            const page_views = await db.db.select().from(schema.page_views);
            const leads = await db.db.select().from(schema.hero_leads);
            
            const stats = {
                total_events: events.length + page_views.length,
                page_views: page_views.length,
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
            const pageViews = await db.db.select().from(schema.page_views);
            
            const event_series = events.filter(e => e.createdAt && e.createdAt >= cutoff);
            const view_series = pageViews.filter(v => v.timestamp && v.timestamp >= cutoff);
            
            // Group by day
            const grouped = {};
            for (let i = 0; i < days; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                grouped[dateStr] = { date: dateStr, views: 0, clicks: 0 };
            }

            view_series.forEach(v => {
                const dateStr = v.timestamp.toISOString().split('T')[0];
                if (grouped[dateStr]) grouped[dateStr].views++;
            });

            event_series.forEach(e => {
                if (e.createdAt && typeof e.createdAt.toISOString === 'function') {
                    const dateStr = e.createdAt.toISOString().split('T')[0];
                    if (grouped[dateStr]) {
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
            // Fetch latest from both tables
            const events = await db.db.select()
                .from(schema.analytics_events)
                .orderBy(db.db.desc(schema.analytics_events.createdAt))
                .limit(50);
            
            const pageViews = await db.db.select()
                .from(schema.page_views)
                .orderBy(db.db.desc(schema.page_views.timestamp))
                .limit(50);

            // Transform page views to match event structure for the dashboard feed
            const normalizedPageViews = pageViews.map(pv => ({
                id: pv.id,
                event_name: 'page_view',
                metadata: {
                    url: pv.page_url,
                    path: pv.page_path,
                    session_id: pv.session_id,
                    device_type: pv.device_type,
                    ...pv.metadata
                },
                context: 'frontend',
                createdAt: pv.timestamp
            }));

            // Combine and sort
            const combined = [...events, ...normalizedPageViews]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, limit);

            return combined;
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

            // Fetch all page view events within range
            const allPageViews = await db.db.select().from(schema.page_views);
            
            const pageViewsInPeriod = allPageViews.filter(v => 
                v.timestamp && v.timestamp >= cutoff
            );

            // Apply filters
            const filtered = pageViewsInPeriod.filter(v => {
                const matchesPage = !pageFilter || v.page_path === pageFilter || v.page_url?.includes(pageFilter);
                const matchesDevice = !deviceFilter || v.device_type === deviceFilter;
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

            filtered.forEach(v => {
                const dateStr = v.timestamp.toISOString().split('T')[0];
                if (grouped[dateStr]) {
                    grouped[dateStr].views++;
                    
                    if (!uniquePerDay[dateStr]) uniquePerDay[dateStr] = new Set();
                    if (v.session_id) {
                        uniquePerDay[dateStr].add(v.session_id);
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
