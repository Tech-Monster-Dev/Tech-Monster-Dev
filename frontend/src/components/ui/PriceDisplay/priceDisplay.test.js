import assert from "node:assert/strict";
import test from "node:test";

import { getProgramPriceDisplay } from "./priceDisplay.js";

test("formats a course price with no offer normally", () => {
    assert.deepEqual(getProgramPriceDisplay(199, 0), {
        originalPrice: "₹199",
        offerPercentage: 0,
        discountedPrice: null,
    });
});

test("calculates and formats a 20% discount from the original price", () => {
    assert.deepEqual(getProgramPriceDisplay(199, 20), {
        originalPrice: "₹199",
        offerPercentage: 20,
        discountedPrice: "₹159.20",
    });
});

test("shows a zero final price for a 100% offer", () => {
    assert.deepEqual(getProgramPriceDisplay(199, 100), {
        originalPrice: "₹199",
        offerPercentage: 100,
        discountedPrice: "₹0.00",
    });
});

test("treats a missing offer as no discount", () => {
    assert.deepEqual(getProgramPriceDisplay(199, undefined), {
        originalPrice: "₹199",
        offerPercentage: 0,
        discountedPrice: null,
    });
});

test("formats fractional INR values with Indian grouping and two decimals", () => {
    assert.deepEqual(getProgramPriceDisplay(12345.5, 20), {
        originalPrice: "₹12,345.5",
        offerPercentage: 20,
        discountedPrice: "₹9,876.40",
    });
});

test("ignores missing, fractional, negative, and over-100 offers", () => {
    for (const offer of [null, 1.5, -1, 101, "invalid"]) {
        assert.deepEqual(getProgramPriceDisplay(199, offer), {
            originalPrice: "₹199",
            offerPercentage: 0,
            discountedPrice: null,
        });
    }
});

test("treats zero and invalid original prices as free without discounts", () => {
    for (const price of [0, -1, "invalid"]) {
        assert.deepEqual(getProgramPriceDisplay(price, 20), {
            originalPrice: "Free",
            offerPercentage: 0,
            discountedPrice: null,
        });
    }
});
