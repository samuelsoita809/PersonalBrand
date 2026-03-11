import { createLogger } from './logger.js';

const logger = createLogger('FeatureFlagService');

/**
 * Feature Flag Service
 * Manages feature toggles based on environment variables or hardcoded rules.
 */
class FeatureFlagService {
    constructor() {
        this.flags = {
            ENABLE_AI_INSIGHTS: process.env.ENABLE_AI_INSIGHTS === 'true' || true,
            ENABLE_NEW_DASHBOARD: process.env.ENABLE_NEW_DASHBOARD === 'true' || false,
            ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true' || true,
        };
    }

    /**
     * Checks if a feature is enabled
     * @param {string} flagName 
     * @returns {boolean}
     */
    isEnabled(flagName) {
        const enabled = !!this.flags[flagName];
        logger.info(`Feature check: ${flagName} is ${enabled ? 'ENABLED' : 'DISABLED'}`);
        return enabled;
    }
}

export const featureFlags = new FeatureFlagService();
