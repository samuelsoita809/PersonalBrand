import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Free Help Request API', () => {
    const validRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        service: 'website_audit',
        message: 'I would like an audit for my website.'
    };

    it('should successfully store a valid free help request', async () => {
        const response = await request(app)
            .post('/api/v1/free-requests')
            .send(validRequest);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.requestId).toBeDefined();
    });

    it('should return 400 if name is missing', async () => {
        const { name, ...invalidRequest } = validRequest;
        const response = await request(app)
            .post('/api/v1/free-requests')
            .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields');
    });

    it('should return 400 if email is missing', async () => {
        const { email, ...invalidRequest } = validRequest;
        const response = await request(app)
            .post('/api/v1/free-requests')
            .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields');
    });

    it('should return 400 if service is missing', async () => {
        const { service, ...invalidRequest } = validRequest;
        const response = await request(app)
            .post('/api/v1/free-requests')
            .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields');
    });

    it('should return 400 if message is missing', async () => {
        const { message, ...invalidRequest } = validRequest;
        const response = await request(app)
            .post('/api/v1/free-requests')
            .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields');
    });
});
