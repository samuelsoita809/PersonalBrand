import express from "express";
import { createLogger, EVENTS, VERSION } from "@monorepo/shared";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import crypto from "crypto";

import { authenticateToken } from "./middleware/auth.js";

import { db } from "./services/db.js";
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
    res.status(200).json({ status: "ok", version: VERSION });
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
    } catch (error) {
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
        await db.db.insert(db.schema.hero_leads).values({
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

// Global Error Handler
app.use((err, req, res, _next) => {
    logger.error('Unhandled Exception:', err);
    res.status(500).json({ 
        error: "Internal Server Error", 
        message: err.message
    });
});


const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, () => logger.info(`Backend running on port ${PORT}`));
}

export default app;

