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

  describe('GET /api/v1/analytics/page-views', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/analytics/page-views');
      expect(res.statusCode).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      // Mock a non-admin token
      const { authService } = await import('../src/services/auth.js');
      const token = await authService.generateToken({ id: 'user1', role: 'user' });
      
      const res = await request(app)
        .get('/api/v1/analytics/page-views')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(403);
    });

    it('should return stats for admin users', async () => {
      // Mock an admin token
      const { authService } = await import('../src/services/auth.js');
      const token = await authService.generateToken({ id: 'admin1', role: 'admin' });
      
      const res = await request(app)
        .get('/api/v1/analytics/page-views')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalViews');
      expect(res.body).toHaveProperty('uniqueViews');
      expect(res.body).toHaveProperty('trends');
      expect(Array.isArray(res.body.trends)).toBe(true);
    });
  });
});
