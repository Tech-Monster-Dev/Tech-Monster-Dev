import assert from "node:assert/strict";
import test from "node:test";

import authorizeRoles from "./role.middleware.js";

const createResponse = () => ({
    statusCode: null,
    body: null,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    },
});

test("allows a role explicitly listed by the route", () => {
    let nextCalled = false;
    const middleware = authorizeRoles("admin");

    middleware(
        { user: { role: "admin" } },
        createResponse(),
        () => {
            nextCalled = true;
        }
    );

    assert.equal(nextCalled, true);
});

test("returns a consistent forbidden response for other roles", () => {
    let nextCalled = false;
    const response = createResponse();

    authorizeRoles("admin")(
        { user: { role: "student" } },
        response,
        () => {
            nextCalled = true;
        }
    );

    assert.equal(nextCalled, false);
    assert.equal(response.statusCode, 403);
    assert.deepEqual(response.body, {
        success: false,
        message: "Access denied",
    });
});
