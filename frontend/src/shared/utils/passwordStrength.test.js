import assert from "node:assert/strict";
import test from "node:test";

import { calculatePasswordStrength } from "./passwordStrength.js";

test("scores each password rule and assigns weak, medium, and strong levels", () => {
    assert.deepEqual(
        {
            score: calculatePasswordStrength("").score,
            strength: calculatePasswordStrength("").strength,
        },
        { score: 0, strength: "Weak" }
    );
    assert.deepEqual(
        {
            score: calculatePasswordStrength("Abcdefg1").score,
            strength: calculatePasswordStrength("Abcdefg1").strength,
        },
        { score: 4, strength: "Medium" }
    );
    assert.deepEqual(
        {
            score: calculatePasswordStrength("Strong#123").score,
            strength: calculatePasswordStrength("Strong#123").strength,
        },
        { score: 5, strength: "Strong" }
    );
});

test("returns a validity flag and label for every password rule", () => {
    const result = calculatePasswordStrength("Abcdefg1");

    assert.equal(result.rules.length, 5);
    assert.deepEqual(
        result.rules.map(({ valid }) => valid),
        [true, true, true, true, false]
    );
    assert.deepEqual(
        result.rules.map(({ label }) => label),
        [
            "At least 8 characters",
            "One uppercase letter",
            "One lowercase letter",
            "One number",
            "One special character",
        ]
    );
});
