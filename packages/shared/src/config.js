// Simple Feature Flag System
export const FEATURE_FLAGS = {
    NEW_HERO_SECTION: true,
    DARK_MODE_TOGGLE: false,
    AI_CHAT_ASSISTANT: false,
    MAINTENANCE_MODE: false,
};

export const isFeatureEnabled = (featureKey) => {
    return !!FEATURE_FLAGS[featureKey];
};

export const VERSION = "1.0.0-beta.1";
