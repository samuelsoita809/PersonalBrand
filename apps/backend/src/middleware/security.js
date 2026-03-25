import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export const configureSecurity = (app) => {
    // 1. Helmet for security headers - Adjusted to allow Vercel Feedback and remote assets
    app.use(helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "script-src": ["'self'", "'unsafe-inline'", "https://vercel.live", "https://*.vercel.app"],
                "img-src": ["'self'", "data:", "https://*"],
                "connect-src": ["'self'", "https://*", "wss://*", "http://localhost:*", "http://127.0.0.1:*"],
                "frame-src": ["'self'", "https://vercel.live"],
            },
        },
    }));

    // 2. CORS configuration
    app.use(cors({
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // 3. Rate Limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // Limit each IP to 1000 requests per windowMs (raised for dashboard polling)
        message: { error: 'Too many requests, please try again later.' },
        standardHeaders: true,
        legacyHeaders: false,
    });

    app.use('/api/', limiter);
};
