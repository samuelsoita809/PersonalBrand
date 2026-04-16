import express from "express";
import { createLogger, EVENTS, VERSION } from "@monorepo/shared";
import dotenv from "dotenv";
import crypto from "crypto";

import { authenticateToken } from "./middleware/auth.js";

import { db, schema } from "./services/db.js";
import { jobQueue } from "./services/jobs.js";
import { analytics } from "./services/analytics.js";
import { aiService } from "./services/ai.js";

import { configureSecurity } from "./middleware/security.js";
import { authService } from "./services/auth.js";


dotenv.config();

const app = express();
configureSecurity(app);

const logger = createLogger('Backend');

app.use(express.json());

app.get("/api/v1/health", (req, res) => {
    logger.trackEvent(EVENTS.REQUEST_RECEIVED, { path: '/api/v1/health' });
    res.status(200).json({ 
        status: "ok", 
        version: VERSION,
        database: !!(process.env.DATABASE_URL || process.env.DIRECT_URL)
    });
});



app.get("/api/v1/profile", async (req, res) => {
    try {
        const profile = await db.getProfile();
        logger.trackEvent(EVENTS.REQUEST_SUCCESS, { path: '/api/v1/profile' });
        res.status(200).json(profile);
    } catch (error) {
        logger.error('Error fetching profile:', error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

/**
 * Authentication Endpoint
 * Public endpoint to exchange credentials for a JWT.
 */
app.post("/api/v1/auth/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const token = await authService.login(username, password);
        logger.info(`Successful login for user: ${username}`);
        res.status(200).json({ token });
    } catch {
        logger.warn(`Failed login attempt for user: ${username}`);
        res.status(401).json({ error: "Invalid credentials" });
    }
});

/**

 * AI Insights Endpoint (Asynchronous Job Pattern)
 * Queues a request for Gemini to generate an insight.
 */
app.post("/api/v1/ai/insight", authenticateToken, async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        logger.info('AI Insight request received - Queueing job');
        
        // Track the initial request
        analytics.track('AI_INSIGHT_REQUESTED', { prompt_preview: prompt.substring(0, 50) });

        // Enqueue the heavy lifting
        jobQueue.add('GENERATE_AI_INSIGHT', async (data) => {
            try {
                const profile = await db.getProfile();
                await aiService.generateInsight(profile, data.prompt);
                
                logger.info('AI Insight Job Completed Successfully');
                analytics.track('AI_INSIGHT_SUCCESS', { job: 'GENERATE_AI_INSIGHT' });
                
                // In a full app, we might notify the user via WebSocket or store the result
            } catch (error) {
                logger.error('Background AI Job Failed', error);
                analytics.track('AI_INSIGHT_FAILURE', { error: error.message });
            }
        }, { prompt });

        // Return 202 Accepted immediately
        res.status(202).json({ 
            message: "AI Insight request accepted and is being processed in the background.",
            jobStatus: "queued"
        });

    } catch (error) {
        logger.error('Failed to queue AI job:', error);
        res.status(500).json({ error: "Failed to initiate AI processing" });
    }
});


/**
 * Analytics Event Tracking
 * Public endpoint to receive frontend events.
 */
app.post("/api/v1/analytics/events", async (req, res) => {
    const { event_name, metadata } = req.body;
    
    if (!event_name) {
        return res.status(400).json({ error: "Event name is required" });
    }

    try {
        await analytics.track(event_name, metadata, 'frontend');
        res.status(204).send();
    } catch (error) {
        logger.error('Failed to record event:', error);
        res.status(500).json({ error: "Failed to record event" });
    }
});

/**
 * Page View Tracking
 * Specialized endpoint for high-volume page view events.
 */
app.post("/api/v1/events/page-view", async (req, res) => {
    const { url, path, session_id, user_id, device_type, metadata } = req.body;
    
    if (!url || !session_id) {
        return res.status(400).json({ error: "URL and session_id are required" });
    }

    try {
        await analytics.trackPageView({
            url,
            path: path || new URL(url).pathname,
            session_id,
            user_id,
            device_type: device_type || 'Desktop',
            metadata: metadata || {}
        });
        res.status(204).send();
    } catch (error) {
        logger.error('Failed to record page view:', error);
        res.status(500).json({ error: "Failed to record page view" });
    }
});

/**
 * CTA Click Tracking
 * Specialized endpoint for tracking engagement with call-to-action buttons.
 */
app.post("/api/v1/events/cta-click", async (req, res) => {
    const { cta_name, cta_id, page_path, session_id, device_type, metadata } = req.body;
    
    if (!cta_name || !session_id) {
        return res.status(400).json({ error: "CTA name and session_id are required" });
    }

    try {
        await analytics.trackCtaClick({
            cta_name,
            cta_id: cta_id || 'unknown',
            page_path: page_path || '/',
            session_id,
            device_type: device_type || 'Desktop',
            metadata: metadata || {}
        });
        res.status(204).send();
    } catch (error) {
        logger.error('Failed to record CTA click:', error);
        res.status(500).json({ error: "Failed to record CTA click" });
    }
});

/**
 * Work With Me CTA Analytics (Slice 8)
 * Root-level endpoint for specialized CTA tracking.
 */
app.post("/api/events", async (req, res) => {
    const { ctaType, sessionId } = req.body;
    
    const validCtaTypes = ["deliver_project", "mentor_me", "coffee_with_me"];
    
    if (!ctaType || !validCtaTypes.includes(ctaType)) {
        return res.status(400).json({ error: "Invalid or missing ctaType" });
    }

    if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required" });
    }

    try {
        await analytics.trackFeaturedCta({ ctaType, sessionId });
        res.status(204).send();
    } catch (error) {
        logger.error('Failed to record featured CTA click:', error);
        res.status(500).json({ error: "Failed to record event" });
    }
});

/**
 * Hero Lead Submission
 * Public endpoint to receive modal form submissions.
 */
app.post("/api/v1/hero/lead", async (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
    }

    try {
        const id = crypto.randomUUID();
        await db.db.insert(schema.hero_leads).values({
            id,
            name,
            email,
            message,
            createdAt: new Date()
        });
        
        logger.info(`New hero lead received: ${email}`);
        
        // Mock Email Integration (as per specification)
        logger.info(`[EMAIL SIMULATION] To: admin@tax-project.com, Subject: New Hero Lead - ${name}`);
        
        res.status(201).json({ status: "success", leadId: id });
    } catch (error) {
        logger.error('Failed to record hero lead:', error);
        res.status(500).json({ error: "Failed to record lead" });
    }
});

/**
 * Project Request Submission (Slice 4)
 * Multi-step form submission from the 'Deliver My Project' journey.
 */
app.post("/api/v1/project-requests", async (req, res) => {
    const { name, email, project_type, selected_plan, description, metadata } = req.body;
    
    if (!name || !email || !project_type || !selected_plan || !description) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const id = crypto.randomUUID();
        await db.db.insert(schema.project_requests).values({
            id,
            name,
            email,
            project_type,
            selected_plan,
            description,
            status: 'pending',
            timestamp: new Date(),
            metadata: metadata || {}
        });
        
        logger.info(`New project request received: ${email} for ${selected_plan} plan`);
        
        // Mock notification for admin
        logger.info(`[NOTIFICATION] New Project Request: ${name} (${selected_plan}) - ${project_type}`);
        
        res.status(201).json({ status: "success", requestId: id });
    } catch (error) {
        logger.error('Failed to record project request:', error);
        res.status(500).json({ error: "Failed to process project request" });
    }
});

/**
 * Mentor Request Submission (Slice 5)
 * Multi-step form submission from the 'Mentor Me' journey.
 */
app.post("/api/v1/mentor-requests", async (req, res) => {
    const { name, email, level, goal, plan, description, metadata } = req.body;
    
    if (!name || !email || !level || !goal || !plan || !description) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const id = crypto.randomUUID();
        await db.db.insert(schema.mentor_requests).values({
            id,
            name,
            email,
            level,
            goal,
            plan,
            description,
            status: 'pending',
            timestamp: new Date(),
            metadata: metadata || {}
        });
        
        logger.info(`New mentor request received: ${email} for ${plan} plan`);
        
        // Mock notification for admin
        logger.info(`[NOTIFICATION] New Mentor Request: ${name} (${plan}) - Goal: ${goal}`);
        
        res.status(201).json({ status: "success", requestId: id });
    } catch (error) {
        logger.error('Failed to record mentor request:', error);
        res.status(500).json({ error: "Failed to process mentor request" });
    }
});

/**
 * Coffee Request Submission (Slice 6)
 * Multi-step form submission from the 'Coffee With Me' journey.
 */
app.post("/api/v1/coffee-requests", async (req, res) => {
    const { name, email, plan, idea, urgency, metadata } = req.body;
    
    if (!name || !email || !plan || !idea || !urgency) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const id = crypto.randomUUID();
        await db.db.insert(schema.coffee_requests).values({
            id,
            name,
            email,
            plan,
            idea,
            urgency,
            status: 'pending',
            createdAt: new Date(),
            metadata: metadata || {}
        });
        
        logger.info(`New coffee request received: ${email} for ${plan} plan`);
        
        // Mock notification for admin
        logger.info(`[NOTIFICATION] New Coffee Consultancy Request: ${name} - Plan: ${plan}, Urgency: ${urgency}`);
        
        res.status(201).json({ status: "success", requestId: id });
    } catch (error) {
        logger.error('Failed to record coffee request:', error);
        res.status(500).json({ error: "Failed to process coffee request" });
    }
});

/**
 * Free Help Request Submission
 * Entry point for the 'Help Me Free' funnel.
 */
app.post("/api/v1/free-requests", async (req, res) => {
    const { name, email, service, message, metadata } = req.body;
    
    if (!name || !email || !service || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const id = crypto.randomUUID();
        await db.db.insert(schema.free_requests).values({
            id,
            name,
            email,
            service,
            message,
            status: 'pending',
            createdAt: new Date(),
            metadata: metadata || {}
        });
        
        logger.info(`New free request received: ${email} for ${service}`);
        
        // Mock notification for admin
        logger.info(`[NOTIFICATION] New Free Help Request: ${name} - Service: ${service}`);
        
        res.status(201).json({ status: "success", requestId: id });
    } catch (error) {
        logger.error('Failed to record free request:', error);
        res.status(500).json({ error: "Failed to process free request" });
    }
});

/**
 * Analytics Summary
 * Protected endpoint for the Admin Dashboard.
 */
app.get("/api/v1/analytics/summary", authenticateToken, async (req, res) => {
    // Only admins can see the full summary
    if (req.user?.role !== 'admin') {
        logger.warn(`Unauthorized access attempt to analytics summary by ${req.user?.id}`);
        return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    try {
        const summary = await analytics.getSummary();
        res.status(200).json(summary);
    } catch (error) {
        logger.error('Failed to fetch analytics summary:', error);
        res.status(500).json({ error: "Failed to fetch analytics summary" });
    }
});

/**
 * Page Views Analytics
 * Detailed breakdown of page traffic.
 */
app.get("/api/v1/analytics/page-views", authenticateToken, async (req, res) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: "Forbidden" });

    const { days, page, device } = req.query;
    
    try {
        const stats = await analytics.getPageViewsStats(
            days ? parseInt(days) : 7,
            page,
            device
        );
        res.status(200).json(stats);
    } catch (error) {
        logger.error('Failed to fetch page views analytics:', error);
        res.status(500).json({ error: "Failed to fetch page views analytics" });
    }
});

/**
 * Analytics Time Series
 * Provides day-by-day stats for the dashboard charts.
 */
app.get("/api/v1/analytics/timeseries", authenticateToken, async (req, res) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: "Forbidden" });

    try {
        const series = await analytics.getTimeSeries(7);
        res.status(200).json(series);
    } catch {
        res.status(500).json({ error: "Failed to fetch time series" });
    }
});

/**
 * Analytics History
 * Provides the raw log of recent events.
 */
app.get("/api/v1/analytics/history", authenticateToken, async (req, res) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: "Forbidden" });

    try {
        const events = await analytics.getRecentEvents(20);
        res.status(200).json(events);
    } catch {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

/**
 * Featured CTA Analytics (Slice 8)
 * Provides detailed stats for the Work With Me journey.
 */
app.get("/api/v1/analytics/featured-cta", authenticateToken, async (req, res) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: "Forbidden" });

    try {
        const stats = await analytics.getFeaturedCtaStats();
        res.status(200).json(stats);
    } catch (error) {
        logger.error('Failed to fetch featured CTA stats:', error);
        res.status(500).json({ error: "Failed to fetch featured CTA stats" });
    }
});

// Global Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    logger.error('Unhandled Exception:', err);
    res.status(500).json({ 
        error: "Internal Server Error", 
        message: err.message
    });
});


const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, () => logger.info(`Backend running on port ${PORT}`));
}

export default app;

