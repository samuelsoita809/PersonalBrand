import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Free Help Request API', () => {
    const validRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        service: 'website_audit',
        message: 'I would like an audit for my website.'
    };

    it('should successfully store a valid free help request with metadata', async () => {
        const requestWithMetadata = {
            ...validRequest,
            metadata: {
                url: 'https://example.com',
                frequency: 'Weekly'
            }
        };
        const response = await request(app)
            .post('/api/v1/free-requests')
            .send(requestWithMetadata);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
    });

    it('should return 400 if name is missing', async () => {
        const invalidRequest = { ...validRequest };
        delete invalidRequest.name;
        const response = await request(app)
            .post('/api/v1/free-requests')
            .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields');
    });

    it('should return 400 if email is missing', async () => {
        const invalidRequest = { ...validRequest };
        delete invalidRequest.email;
        const response = await request(app)
            .post('/api/v1/free-requests')
            .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields');
    });

    it('should return 400 if service is missing', async () => {
        const invalidRequest = { ...validRequest };
        delete invalidRequest.service;
        const response = await request(app)
            .post('/api/v1/free-requests')
            .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields');
    });

    it('should return 400 if message is missing', async () => {
        const invalidRequest = { ...validRequest };
        delete invalidRequest.message;
        const response = await request(app)
            .post('/api/v1/free-requests')
            .send(invalidRequest);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields');
    });
});
