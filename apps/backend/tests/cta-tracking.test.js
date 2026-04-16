import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Slice 8: CTA Tracking API', () => {
    describe('POST /api/events', () => {
        it('should track a valid featured CTA click', async () => {
            const payload = {
                ctaType: 'mentor_me',
                sessionId: 'test-session-123'
            };

            const res = await request(app)
                .post('/api/events')
                .send(payload);

            expect(res.statusCode).toBe(204);
        });

        it('should return 400 for an invalid ctaType', async () => {
            const payload = {
                ctaType: 'invalid_type',
                sessionId: 'test-session-123'
            };

            const res = await request(app)
                .post('/api/events')
                .send(payload);

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Invalid or missing ctaType');
        });

        it('should return 400 when sessionId is missing', async () => {
            const payload = {
                ctaType: 'deliver_project'
            };

            const res = await request(app)
                .post('/api/events')
                .send(payload);

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('sessionId is required');
        });
    });

    describe('GET /api/v1/analytics/featured-cta', () => {
        it('should return 401 for unauthenticated requests', async () => {
            const res = await request(app).get('/api/v1/analytics/featured-cta');
            expect(res.statusCode).toBe(401);
        });

        it('should return stats for authenticated admin', async () => {
            // Get admin token
            const { authService } = await import('../src/services/auth.js');
            const token = await authService.generateToken({ id: 'admin-id', role: 'admin' });

            const res = await request(app)
                .get('/api/v1/analytics/featured-cta')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('counts');
            expect(res.body).toHaveProperty('timeSeries');
            expect(res.body).toHaveProperty('conversions');
            expect(res.body).toHaveProperty('totalViews');
        });
    });
});
