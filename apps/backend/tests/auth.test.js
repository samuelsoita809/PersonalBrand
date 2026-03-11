import { test, expect, describe } from 'vitest';
import request from "supertest";
import app from "../src/index.js";
import { authService } from "../src/services/auth.js";

describe("Authentication Flow", () => {
    test("POST /api/v1/ai/insight should fail without token", async () => {
        const res = await request(app)
            .post("/api/v1/ai/insight")
            .send({ prompt: "Hello" });
        
        if (res.statusCode !== 401) {
            console.error('FAILED WITHOUT TOKEN:', res.statusCode, res.body);
        }
        expect(res.statusCode).toBe(401);

        expect(res.body.error).toContain("Access token missing");
    });

    test("POST /api/v1/ai/insight should fail with invalid token", async () => {
        const res = await request(app)
            .post("/api/v1/ai/insight")
            .set("Authorization", "Bearer invalid-token")
            .send({ prompt: "Hello" });
        
        expect(res.statusCode).toBe(403);
    });

    test("POST /api/v1/ai/insight should pass with valid token (mocked)", async () => {
        const token = await authService.generateToken({ user: "samuel" });
        
        const res = await request(app)
            .post("/api/v1/ai/insight")
            .set("Authorization", `Bearer ${token}`)
            .send({ prompt: "What is my tech stack?" });
        
        // Since we use the JobQueue pattern, we expect 202 Accepted
        expect(res.statusCode).toBe(202);
        expect(res.body.jobStatus).toBe("queued");
    });
});

