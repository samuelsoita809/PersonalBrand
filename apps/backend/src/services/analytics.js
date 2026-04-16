import { db } from './db.js';
import { eq, sql, desc, count, gte, and, like, between, asc } from 'drizzle-orm';
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

    /**
     * Records a "Work With Me" CTA click to the dedicated 'events' table (Slice 8).
     * @param {Object} data 
     */
    async trackFeaturedCta(data) {
        try {
            logger.info(`Tracking Featured CTA: ${data.ctaType}`, { sid: data.sessionId });
            
            await db.db.insert(schema.events).values({
                event_id: crypto.randomUUID(),
                cta_type: data.ctaType,
                session_id: data.sessionId,
                timestamp: new Date()
            });
        } catch (error) {
            logger.error('Failed to record featured CTA event:', error);
            throw error;
        }
    }

    async getFeaturedCtaStats() {
        try {
            logger.info('Aggregating Featured CTA stats via SQL');
            
            // 1. Total Clicks by type (Grouped SQL)
            const typeCounts = await db.db.select({
                type: schema.events.cta_type,
                count: count()
            }).from(schema.events).groupBy(schema.events.cta_type);
            
            const counts = {
                deliver_project: 0,
                mentor_me: 0,
                coffee_with_me: 0
            };
            typeCounts.forEach(c => {
                if (counts[c.type] !== undefined) counts[c.type] = Number(c.count);
            });

            // 2. Time Series (Last 7 days filtered at DB level)
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 7);
            
            const rawTrend = await db.db.select({
                date: sql`${schema.events.timestamp}::date::text`,
                count: count()
            })
            .from(schema.events)
            .where(gte(schema.events.timestamp, cutoff))
            .groupBy(sql`${schema.events.timestamp}::date`)
            .orderBy(asc(sql`${schema.events.timestamp}::date`));

            // Normalize time series for frontend (ensures every day has an entry)
            const trendMap = {};
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                trendMap[dateStr] = { date: dateStr, clicks: 0 };
            }

            rawTrend.forEach(row => {
                const dateStr = String(row.date);
                if (trendMap[dateStr]) trendMap[dateStr].clicks = Number(row.count);
            });

            const timeSeries = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

            // 3. Funnel Counts (Fast SQL counts)
            const [pCount, mCount, cCount] = await Promise.all([
                db.db.select({ count: count() }).from(schema.project_requests),
                db.db.select({ count: count() }).from(schema.mentor_requests),
                db.db.select({ count: count() }).from(schema.coffee_requests)
            ]);

            const conversions = {
                deliver_project: Number(pCount[0].count),
                mentor_me: Number(mCount[0].count),
                coffee_with_me: Number(cCount[0].count)
            };

            // 4. CTR Source (Filtered count)
            const heroViews = await db.db.select({ count: count() })
                .from(schema.analytics_events)
                .where(eq(schema.analytics_events.event_name, 'hero_view'));
            
            const totalViews = Number(heroViews[0].count) || 1;

            return {
                counts,
                timeSeries,
                conversions,
                totalViews,
                isReal: true
            };
        } catch (error) {
            logger.error('Failed to get optimized featured CTA stats:', error);
            return { counts: {}, timeSeries: [], conversions: {}, totalViews: 0, isReal: false };
        }
    }

    async getSummary() {
        try {
            logger.info('Fetching optimized summary stats via SQL');
            
            const [totalEvents, pageViews, ctaClicks, modalOpens, leadsCount] = await Promise.all([
                db.db.select({ count: count() }).from(schema.analytics_events),
                db.db.select({ count: count() }).from(schema.page_views),
                db.db.select({ count: count() }).from(schema.analytics_events).where(like(schema.analytics_events.event_name, 'cta_%')),
                db.db.select({ count: count() }).from(schema.analytics_events).where(eq(schema.analytics_events.event_name, 'modal_open')),
                db.db.select({ count: count() }).from(schema.hero_leads)
            ]);

            const stats = {
                total_events: Number(totalEvents[0].count) + Number(pageViews[0].count),
                page_views: Number(pageViews[0].count),
                cta_clicks: Number(ctaClicks[0].count),
                modal_opens: Number(modalOpens[0].count),
                leads: Number(leadsCount[0].count)
            };

            stats.ctr = stats.page_views > 0 ? (stats.cta_clicks / stats.page_views).toFixed(4) : 0;
            stats.modal_rate = stats.cta_clicks > 0 ? (stats.modal_opens / stats.cta_clicks).toFixed(4) : 0;

            return { ...stats, isReal: true };
        } catch (error) {
            logger.warn('Failed to fetch analytics summary:', error.message);
            return {
                total_events: 0, page_views: 0, cta_clicks: 0, modal_opens: 0, leads: 0,
                ctr: 0, modal_rate: 0, isReal: false, error: error.message
            };
        }
    }

    async getTimeSeries(days = 7) {
        try {
            logger.info('Fetching optimized time series via SQL');
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);

            const [viewSeries, clickSeries] = await Promise.all([
                db.db.select({
                    date: sql`${schema.page_views.timestamp}::date::text`,
                    count: count()
                })
                .from(schema.page_views)
                .where(gte(schema.page_views.timestamp, cutoff))
                .groupBy(sql`${schema.page_views.timestamp}::date`),

                db.db.select({
                    date: sql`${schema.analytics_events.createdAt}::date::text`,
                    count: count()
                })
                .from(schema.analytics_events)
                .where(and(
                    gte(schema.analytics_events.createdAt, cutoff),
                    like(schema.analytics_events.event_name, 'cta_%')
                ))
                .groupBy(sql`${schema.analytics_events.createdAt}::date`)
            ]);
            
            // Group by day into final format
            const grouped = {};
            for (let i = 0; i < days; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                grouped[dateStr] = { date: dateStr, views: 0, clicks: 0 };
            }

            viewSeries.forEach(v => {
                const dateStr = String(v.date);
                if (grouped[dateStr]) grouped[dateStr].views = Number(v.count);
            });

            clickSeries.forEach(c => {
                const dateStr = String(c.date);
                if (grouped[dateStr]) grouped[dateStr].clicks = Number(c.count);
            });

            return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
        } catch (error) {
            logger.warn('Failed to fetch time series:', error.message);
            return [];
        }
    }

    async getRecentEvents(limit = 10) {
        try {
            logger.info('Fetching recent events with strict SQL limits');
            const events = await db.db.select()
                .from(schema.analytics_events)
                .orderBy(desc(schema.analytics_events.createdAt))
                .limit(limit);
            
            const pageViews = await db.db.select()
                .from(schema.page_views)
                .orderBy(desc(schema.page_views.timestamp))
                .limit(limit);

            const normalizedPageViews = pageViews.map(pv => ({
                id: pv.id,
                event_name: 'page_view',
                metadata: { ...pv.metadata, url: pv.page_url, path: pv.page_path },
                context: 'frontend',
                createdAt: pv.timestamp
            }));

            return [...events, ...normalizedPageViews]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, limit);
        } catch (error) {
            logger.warn('Failed to fetch recent events:', error.message);
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
            logger.info('Fetching optimized page view stats via SQL');
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);

            let whereClause = gte(schema.page_views.timestamp, cutoff);
            if (pageFilter) whereClause = and(whereClause, eq(schema.page_views.page_path, pageFilter));
            if (deviceFilter) whereClause = and(whereClause, eq(schema.page_views.device_type, deviceFilter));

            const [summary, topPages, devices, trends] = await Promise.all([
                // 1. Summary
                db.db.select({
                    total: count(),
                    unique: count(schema.page_views.session_id)
                }).from(schema.page_views).where(whereClause),

                // 2. Top Pages
                db.db.select({
                    name: schema.page_views.page_path,
                    views: count()
                })
                .from(schema.page_views)
                .where(whereClause)
                .groupBy(schema.page_views.page_path)
                .orderBy(desc(count()))
                .limit(10),

                // 3. Devices
                db.db.select({
                    name: schema.page_views.device_type,
                    value: count()
                })
                .from(schema.page_views)
                .where(whereClause)
                .groupBy(schema.page_views.device_type),

                // 4. Trends (Optimized with explicit casting)
                db.db.select({
                    date: sql`${schema.page_views.timestamp}::date::text`,
                    views: count(),
                    unique: count(schema.page_views.session_id)
                })
                .from(schema.page_views)
                .where(whereClause)
                .groupBy(sql`${schema.page_views.timestamp}::date`)
                .orderBy(asc(sql`${schema.page_views.timestamp}::date`))
            ]);

            return {
                totalViews: summary[0] ? Number(summary[0].total) : 0,
                uniqueViews: summary[0] ? Number(summary[0].unique) : 0,
                topPages: topPages.map(p => ({ ...p, views: Number(p.views) })),
                devices: devices.map(d => ({ ...d, value: Number(d.value) })),
                trends: trends.map(t => ({
                    date: String(t.date),
                    views: Number(t.views),
                    unique: Number(t.unique)
                })),
                isReal: true
            };
        } catch (error) {
            logger.error('Failed to get optimized page view stats:', error);
            return { totalViews: 0, uniqueViews: 0, topPages: [], devices: [], trends: [], isReal: false };
        }
    }
}

export const analytics = new AnalyticsService();
