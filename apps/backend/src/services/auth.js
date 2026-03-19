import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createLogger } from '@monorepo/shared';

dotenv.config();

const logger = createLogger('AuthService');
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-change-this';

/**
 * Authentication Service
 * Handles signing and verifying JSON Web Tokens.
 */
class AuthService {
    /**
     * Signs a new JWT for a user
     * @param {Object} payload - Data to encode in the token
     * @returns {string} token
     */
    async generateToken(payload) {
        try {
            return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
        } catch (error) {
            logger.error('Error generating token:', error);
            throw new Error('Token generation failed');
        }
    }

    /**
     * Verifies a JWT
     * @param {string} token 
     * @returns {Object} decoded payload
     */
    async verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            logger.error('Error verifying token:', error);
            throw new Error('Invalid or expired token');
        }
    }
    /**
     * Authenticates a user and returns a token
     * @param {string} username 
     * @param {string} password 
     * @returns {string} token
     */
    async login(username, password) {
        // Simple security check using environmental variables
        const adminUser = process.env.ADMIN_USERNAME || 'admin';
        const adminPass = process.env.ADMIN_PASSWORD || 'password123';

        if (username === adminUser && password === adminPass) {
            return this.generateToken({ 
                id: 'admin-1',
                username: adminUser, 
                role: 'admin' 
            });
        }
        
        throw new Error('Invalid credentials');
    }
}

export const authService = new AuthService();
