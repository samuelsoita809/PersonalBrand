import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { db, schema } from '../src/services/db.js';

// We need to mock the full app or a subset of it
// For simplicity, let's assume the app is exported or we can recreate the route
// But it's better to test against the real app instance if possible.
// Since we don't want to start the full server, we'll mock the db.

vi.mock('../src/services/db.js', () => ({
    db: {
        db: {
            insert: vi.fn(() => ({
                values: vi.fn().mockResolvedValue([{ id: '123' }])
            })),
            select: vi.fn(() => ({
                from: vi.fn(() => ({
                    orderBy: vi.fn().mockResolvedValue([
                        { id: '1', name: 'John', email: 'john@example.com', intent: 'Mentorship' }
                    ])
                }))
            }))
        }
    },
    schema: {
        chat_leads: {
            createdAt: 'created_at'
        }
    }
}));

vi.mock('../src/services/analytics.js', () => ({
    analytics: {
        track: vi.fn().mockResolvedValue({})
    }
}));

vi.mock('../src/middleware/auth.js', () => ({
    authenticateToken: (req, res, next) => {
        req.user = { id: 'admin-123', role: 'admin' };
        next();
    }
}));

// Import the app after mocks
import app from '../src/index.js'; 

describe('Chat Leads API (TaiktousSlice3)', () => {
    
    it('should capture a new lead successfully', async () => {
        const response = await request(app)
            .post('/api/v1/chat/leads')
            .send({
                name: 'Jane Doe',
                email: 'jane@example.com',
                intent: 'Mentorship',
                session_id: 'test-session-456'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Lead captured successfully');
        expect(db.db.insert).toHaveBeenCalled();
    });

    it('should return 400 for invalid email', async () => {
        const response = await request(app)
            .post('/api/v1/chat/leads')
            .send({
                name: 'Jane Doe',
                email: 'invalid-email',
                intent: 'Mentorship',
                session_id: 'test-session-456'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid email format');
    });

    it('should fetch leads for admin', async () => {
        const response = await request(app)
            .get('/api/v1/chat/leads')
            .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0].name).toBe('John');
    });
});
