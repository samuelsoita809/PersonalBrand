import { GoogleGenerativeAI } from "@google/generative-ai";
import { createLogger } from "@monorepo/shared";
import dotenv from "dotenv";

dotenv.config();

const logger = createLogger('AIService');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * AI Service
 * Handles content generation requests to Gemini.
 */
class AIService {
    /**
     * Generates insight based on profile and prompt
     * @param {Object} profile 
     * @param {string} prompt 
     * @returns {Promise<string>} insight text
     */
    async generateInsight(profile, prompt) {
        try {
            logger.info('Generating AI insight...');
            const fullPrompt = `As a professional career advisor, given this profile: ${JSON.stringify(profile)}. Answer this request: ${prompt}`;
            
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            logger.error('Gemini content generation failed', error);
            throw error;
        }
    }
}

export const aiService = new AIService();
