import winston from 'winston';

export const createLogger = (context) => {
    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        defaultMeta: { service: 'brand-service', context },
        transports: [
            new winston.transports.Console()
        ],
    });

    // Add XAWoW business event tracking
    logger.trackEvent = (eventName, metadata = {}) => {
        logger.info(`EVENT:${eventName}`, { ...metadata });
    };

    return logger;
};


