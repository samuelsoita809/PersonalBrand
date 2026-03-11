import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('GET /api/v1/health', () => {
  it('should return 200 and status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('version');
  });
});


