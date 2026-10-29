import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";

import User from "../../modules/user/models/User.js";
import { protect } from "./auth.middleware.js";

const withJwtSecret = async (callback) => {
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "test-jwt-secret";

    try {
        await callback();
    } finally {
        if (previousSecret === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = previousSecret;
        }
    }
};

const runProtect = (headers = {}) =>
    new Promise((resolve) => {
        const request = { headers };

        protect(request, {}, (error) => {
            resolve({
                error,
                nextCalled: true,
                request,
            });
        });
    });

test("rejects missing and malformed bearer tokens before querying users", async (t) => {
    const findById = t.mock.method(User, "findById", () => {
        throw new Error("Invalid credentials must not query users");
    });

    const missing = await runProtect();
    assert.equal(missing.nextCalled, true);
    assert.equal(missing.error.statusCode, 401);
    assert.equal(
        missing.error.message,
        "Not authorized. No token provided."
    );

    await withJwtSecret(async () => {
        const invalid = await runProtect({
            authorization: "Bearer not-a-valid-token",
        });
        assert.equal(invalid.error.name, "JsonWebTokenError");
    });

    assert.equal(findById.mock.callCount(), 0);
});

test("attaches the authenticated user without password fields", async (t) => {
    const user = { _id: "student-1", role: "student" };
    let selectedFields;
    t.mock.method(User, "findById", (id) => {
        assert.equal(id, "student-1");
        return {
            select: async (fields) => {
                selectedFields = fields;
                return user;
            },
        };
    });
    const token = jwt.sign(
        { id: "student-1" },
        "test-jwt-secret"
    );
    const request = { headers: { authorization: `Bearer ${token}` } };

    await withJwtSecret(async () => {
        const result = await new Promise((resolve) => {
            protect(request, {}, (error) => resolve(error));
        });
        assert.equal(result, undefined);
    });

    assert.equal(selectedFields, "-password");
    assert.equal(request.user, user);
});

test("returns not-found for a valid token whose user no longer exists", async (t) => {
    let selected = false;
    const findById = t.mock.method(User, "findById", () => ({
        select: async () => {
            selected = true;
            return null;
        },
    }));
    const token = jwt.sign(
        { id: "deleted-user" },
        "test-jwt-secret"
    );

    await withJwtSecret(async () => {
        const result = await runProtect({
            authorization: `Bearer ${token}`,
        });
        assert.equal(findById.mock.callCount(), 1);
        assert.equal(selected, true);
        assert.equal(result.error.statusCode, 404);
        assert.equal(result.error.message, "User not found");
    });
});
