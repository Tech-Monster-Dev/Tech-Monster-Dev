import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";

import app from "./app.js";

test("health endpoint returns the API health response", async () => {
    const previousMaintenanceMode = process.env.MAINTENANCE_MODE;
    delete process.env.MAINTENANCE_MODE;

    try {
        const response = await request(app).get("/api/health");

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, { success: true });
    } finally {
        if (previousMaintenanceMode === undefined) {
            delete process.env.MAINTENANCE_MODE;
        } else {
            process.env.MAINTENANCE_MODE = previousMaintenanceMode;
        }
    }
});

test("certificate payment creation rejects requests without authentication", async () => {
    const response = await request(app)
        .post("/api/certificate-payments/create")
        .send({ courseId: "course-1" });

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, {
        success: false,
        statusCode: 401,
        message: "Not authorized. No token provided.",
    });
});

test("signup validates malformed requests before database work", async () => {
    const response = await request(app)
        .post("/api/auth/signup")
        .send({
            username: "ab",
            email: "not-an-email",
            password: "weak",
        });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.ok(Array.isArray(response.body.errors));
    assert.ok(response.body.errors.length > 0);
});
