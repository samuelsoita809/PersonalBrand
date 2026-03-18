import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/index';

// We'll use a real-ish test for the events endpoint if possible, 
// but we might need to mock the database service.
describe('Analytics API', () => {
  describe('POST /api/v1/analytics/events', () => {
    it('should track a page_view event', async () => {
      const payload = {
        event_name: 'page_view',
        metadata: { 
          page: 'home',
          url: 'http://localhost:5173/',
          timestamp: new Date().toISOString()
        }
      };

      const res = await request(app)
        .post('/api/v1/analytics/events')
        .send(payload);

      expect(res.statusCode).toBe(204);
    });

    it('should track a cta_click event', async () => {
      const payload = {
        event_name: 'cta_click',
        metadata: { 
          id: 'hero_work_cta',
          url: 'http://localhost:5173/',
          timestamp: new Date().toISOString()
        }
      };

      const res = await request(app)
        .post('/api/v1/analytics/events')
        .send(payload);

      expect(res.statusCode).toBe(204);
    });
  });

  describe('GET /api/v1/analytics/summary', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/analytics/summary');
      expect(res.statusCode).toBe(401);
    });
  });
});
