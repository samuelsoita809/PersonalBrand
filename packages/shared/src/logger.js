// Monitoring and Event Tracking Utility
export const createLogger = (context) => {
    return {
        info: (message, data = {}) => {
            console.log(`[INFO][${context}] ${message}`, JSON.stringify(data));
        },
        error: (message, error = {}) => {
            console.error(`[ERROR][${context}] ${message}`, error);
            // In a real app, this would send to an incident tracking service (e.g., Sentry)
        },
        trackEvent: (eventName, metadata = {}) => {
            console.log(`[EVENT][${context}] ${eventName}`, JSON.stringify(metadata));
            // In a real app, this would send to an analytics service (e.g., Mixpanel)
        }
    };
};
