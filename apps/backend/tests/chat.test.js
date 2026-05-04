import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { db } from '../src/services/db.js';
import { analytics } from '../src/services/analytics.js';

vi.mock('../src/services/db.js', () => ({
    db: {
        db: {
            insert: vi.fn(() => ({
                values: vi.fn(() => Promise.resolve())
            }))
        }
    },
    schema: {
        chat_sessions: {
            id: 'id',
            session_id: 'session_id',
            intent: 'intent',
            createdAt: 'created_at'
        }
    }
}));

vi.mock('../src/services/analytics.js', () => ({
    analytics: {
        track: vi.fn(() => Promise.resolve())
    }
}));

describe('Chat API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should start a chat session with valid intent', async () => {
        const response = await request(app)
            .post('/api/v1/chat/start')
            .send({
                intent: 'Start a Project',
                session_id: 'test-session-123'
            });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(db.db.insert).toHaveBeenCalled();
        expect(analytics.track).toHaveBeenCalledWith('CHAT_STARTED', expect.any(Object), 'frontend');
    });

    it('should return 400 for invalid intent', async () => {
        const response = await request(app)
            .post('/api/v1/chat/start')
            .send({
                intent: 'Invalid Intent',
                session_id: 'test-session-123'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid or missing intent');
    });

    it('should return 400 if session_id is missing', async () => {
        const response = await request(app)
            .post('/api/v1/chat/start')
            .send({
                intent: 'Start a Project'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('session_id is required');
    });
});
