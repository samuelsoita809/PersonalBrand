import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

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
  
  describe('POST /api/v1/events/page-view', () => {
    it('should record a valid page view and reflect in stats', async () => {
      // 1. Get initial stats
      const { authService } = await import('../src/services/auth.js');
      const adminToken = await authService.generateToken({ id: 'admin-final', role: 'admin' });
      
      const initialRes = await request(app)
        .get('/api/v1/analytics/page-views')
        .set('Authorization', `Bearer ${adminToken}`);
      
      const initialTotal = initialRes.body.totalViews || 0;

      // 2. Post new page view
      const payload = {
        url: 'http://localhost:8001/final-test-page',
        path: '/final-test-page',
        session_id: `session-${Date.now()}`,
        device_type: 'Desktop',
        metadata: { referrer: 'direct-test' }
      };

      const res = await request(app)
        .post('/api/v1/events/page-view')
        .send(payload);

      expect(res.statusCode).toBe(204);

      // 3. Verify stats incremented
      const finalRes = await request(app)
        .get('/api/v1/analytics/page-views')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(finalRes.body.totalViews).toBe(initialTotal + 1);
    });

    it('should return 400 if url is missing', async () => {
      const payload = {
        session_id: 'test-session-456'
      };

      const res = await request(app)
        .post('/api/v1/events/page-view')
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("URL and session_id are required");
    });

    it('should return 400 if session_id is missing', async () => {
      const payload = {
        url: 'http://localhost:8001/about'
      };

      const res = await request(app)
        .post('/api/v1/events/page-view')
        .send(payload);

      expect(res.statusCode).toBe(400);
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

  describe('POST /api/v1/events/cta-click', () => {
    it('should record a valid CTA click', async () => {
      const payload = {
        cta_name: 'work_with_me',
        cta_id: 'cta-123',
        page_path: '/',
        session_id: 'session-abc',
        device_type: 'Desktop'
      };
      const res = await request(app)
        .post('/api/v1/events/cta-click')
        .send(payload);
      
      expect(res.statusCode).toBe(204);
    });

    it('should return 400 if cta_name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/events/cta-click')
        .send({ session_id: 'session-abc' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("CTA name and session_id are required");
    });

    it('should return 400 if session_id is missing', async () => {
      const res = await request(app)
        .post('/api/v1/events/cta-click')
        .send({ cta_name: 'work_with_me' });
      expect(res.statusCode).toBe(400);
    });
  });
});
