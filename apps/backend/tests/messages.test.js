import { test, expect } from 'vitest';
import request from "supertest";
import app from "../src/index.js";

test("health endpoint returns ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
});

test("profile endpoint returns correct data", async () => {
    const res = await request(app).get("/api/v1/profile");
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Samuel Soita");
});
