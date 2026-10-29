import assert from "node:assert/strict";
import test from "node:test";

import { forgotPasswordSchema } from "./forgotPasswordSchema.js";
import { loginSchema } from "./loginSchema.js";
import { resetPasswordSchema } from "./resetPasswordSchema.js";
import { signupSchema } from "./signupSchema.js";

test("login requires a valid email and a six-character password", () => {
    assert.equal(
        loginSchema.safeParse({
            email: "student@example.com",
            password: "123456",
        }).success,
        true
    );

    const emptyResult = loginSchema.safeParse({
        email: "",
        password: "12345",
    });

    assert.equal(emptyResult.success, false);
    assert.ok(
        emptyResult.error.issues.some(
            (issue) => issue.message === "Email is required"
        )
    );
    assert.ok(
        emptyResult.error.issues.some(
            (issue) => issue.message === "Invalid email"
        )
    );
    assert.ok(
        emptyResult.error.issues.some(
            (issue) =>
                issue.message === "Password must be at least 6 characters"
        )
    );
    assert.equal(
        loginSchema.safeParse({
            email: "not-an-email",
            password: "123456",
        }).success,
        false
    );
});

test("signup trims username and email and enforces password, confirmation, and terms", () => {
    const validResult = signupSchema.safeParse({
        username: "  Learner  ",
        email: "  learner@example.com  ",
        password: "Strong#123",
        confirmPassword: "Strong#123",
        terms: true,
    });

    assert.equal(validResult.success, true);
    assert.equal(validResult.data.username, "Learner");
    assert.equal(validResult.data.email, "learner@example.com");

    const invalidResult = signupSchema.safeParse({
        username: "AB",
        email: "invalid",
        password: "weak",
        confirmPassword: "different",
        terms: false,
    });

    assert.equal(invalidResult.success, false);
    assert.ok(
        invalidResult.error.issues.some(
            (issue) => issue.path[0] === "terms"
        )
    );
    assert.ok(
        invalidResult.error.issues.some(
            (issue) => issue.path[0] === "confirmPassword"
        )
    );
    assert.ok(
        invalidResult.error.issues.some(
            (issue) => issue.path[0] === "password"
        )
    );
});

test("forgot-password and reset-password schemas validate required data", () => {
    assert.equal(
        forgotPasswordSchema.safeParse({
            email: "  learner@example.com  ",
        }).success,
        true
    );
    assert.equal(
        forgotPasswordSchema.safeParse({ email: " " }).success,
        false
    );

    const validReset = {
        password: "Strong#123",
        confirmPassword: "Strong#123",
    };

    assert.equal(resetPasswordSchema.safeParse(validReset).success, true);
    assert.equal(
        resetPasswordSchema.safeParse({
            ...validReset,
            confirmPassword: "Different#123",
        }).success,
        false
    );
    assert.equal(
        resetPasswordSchema.safeParse({
            password: "weak",
            confirmPassword: "weak",
        }).success,
        false
    );
});
