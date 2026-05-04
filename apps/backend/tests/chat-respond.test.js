import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { analytics } from '../src/services/analytics.js';

vi.mock('../src/services/analytics.js', () => ({
    analytics: {
        track: vi.fn(() => Promise.resolve())
    }
}));

describe('Chat Respond API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return correct response for "Start a Project"', async () => {
        const response = await request(app)
            .post('/api/v1/chat/respond')
            .send({ intent: 'Start a Project' });

        expect(response.status).toBe(200);
        expect(response.body.ctaText).toBe('Deliver My Project');
        expect(response.body.solutionId).toBe('deliver_project');
        expect(analytics.track).toHaveBeenCalledWith('SOLUTION_RECOMMENDED', expect.any(Object), 'frontend');
    });

    it('should return fallback for unknown intent', async () => {
        const response = await request(app)
            .post('/api/v1/chat/respond')
            .send({ intent: 'Unknown' });

        expect(response.status).toBe(200);
        expect(response.body.ctaText).toBe('Show Options Again');
        expect(response.body.solutionId).toBe('show_options');
    });
});
