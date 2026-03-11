import express from "express";
import { createLogger, EVENTS, VERSION } from "@monorepo/shared";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

import { authenticateToken } from "./middleware/auth.js";

import { db } from "./services/db.js";
import { jobQueue } from "./services/jobs.js";
import { analytics } from "./services/analytics.js";
import { aiService } from "./services/ai.js";

import { configureSecurity } from "./middleware/security.js";


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
                const text = await aiService.generateInsight(profile, data.prompt);
                
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


// Global Error Handler
app.use((err, req, res, next) => {
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

