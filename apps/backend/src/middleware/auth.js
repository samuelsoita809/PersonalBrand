import { authService } from '../services/auth.js';
import { createLogger } from '@monorepo/shared';

const logger = createLogger('AuthMiddleware');

/**
 * Express middleware to verify JWT in Authorization header
 */
export const authenticateToken = async (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn('Unauthorized request: No token provided');
        return res.status(401).json({ error: 'Unauthorized: Access token missing' });
    }



    try {
        const user = await authService.verifyToken(token);
        logger.info(`Authenticated user: ${user.username} (Role: ${user.role})`);
        req.user = user;
        next();
    } catch (error) {
        logger.error('Forbidden: Invalid token or role mapping failure', error);
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    }
};
