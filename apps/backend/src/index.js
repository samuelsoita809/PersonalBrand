import express from "express";
import { createLogger, EVENTS, VERSION } from "@monorepo/shared";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

import { db } from "./services/db.js";

dotenv.config();

const app = express();
const logger = createLogger('Backend');
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
 * AI Insights Endpoint
 * Processes profile data through Gemini to generate a professional summary or advice.
 */
app.post("/api/v1/ai/insight", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        logger.trackEvent(EVENTS.REQUEST_RECEIVED, { path: '/api/v1/ai/insight' });
        const profile = await db.getProfile();

        const fullPrompt = `As a professional career advisor, given this profile: ${JSON.stringify(profile)}. Answer this request: ${prompt}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        logger.trackEvent(EVENTS.REQUEST_SUCCESS, { path: '/api/v1/ai/insight' });
        res.status(200).json({ insight: text });
    } catch (error) {
        logger.error('Gemini AI processing error:', error);
        res.status(500).json({ error: "AI Insight generation failed" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => logger.info(`Backend running on port ${PORT}`));

export default app;
