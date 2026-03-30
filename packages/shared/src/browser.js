export * from "./events.js";
export * from "./config.js";

// Safe Feature Flags (no process.env)
class FeatureFlagService {
    constructor() {
        this.flags = {
            ENABLE_AI_INSIGHTS: true,
            ENABLE_NEW_DASHBOARD: false,
            ENABLE_ANALYTICS: true,
        };
        try {
            if (typeof import.meta !== 'undefined' && import.meta.env) {
                this.flags.ENABLE_AI_INSIGHTS = import.meta.env.VITE_ENABLE_AI_INSIGHTS === 'true' || true;
                this.flags.ENABLE_NEW_DASHBOARD = import.meta.env.VITE_ENABLE_NEW_DASHBOARD === 'true' || false;
            }
        } catch {
            // Ignore context errors
        }
    }

    isEnabled(flagName) {
        return !!this.flags[flagName];
    }
}

export const featureFlags = new FeatureFlagService();

// Safe logger (no winston dependency)
export const createLogger = (context) => {
    const logger = {
        info: (msg, meta) => console.log(`[${context}] INFO: ${msg}`, meta || ''),
        error: (msg, meta) => console.error(`[${context}] ERROR: ${msg}`, meta || ''),
        warn: (msg, meta) => console.warn(`[${context}] WARN: ${msg}`, meta || '')
    };

    logger.trackEvent = (eventName, metadata = {}) => {
        console.log(`[${context}] EVENT:${eventName}`, metadata);
    };

    return logger;
};
