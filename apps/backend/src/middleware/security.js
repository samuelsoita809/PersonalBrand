import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export const configureSecurity = (app) => {
    // 1. Helmet for security headers
    app.use(helmet());

    // 2. CORS configuration
    app.use(cors({
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // 3. Rate Limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: { error: 'Too many requests, please try again later.' },
        standardHeaders: true,
        legacyHeaders: false,
    });

    app.use('/api/', limiter);
};
