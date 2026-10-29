import assert from "node:assert/strict";
import test from "node:test";

import {
    formatCertificateAmount,
    formatPaymentTime,
} from "./certificatePayment.utils.js";

test("formats valid certificate amounts and preserves non-numeric values", () => {
    assert.equal(formatCertificateAmount(199), "₹199.00");
    assert.equal(formatCertificateAmount("1234.5"), "₹1,234.50");
    assert.equal(formatCertificateAmount("pending"), "INR pending");
});

test("returns an empty amount for absent values and supports currency overrides", () => {
    assert.equal(formatCertificateAmount(null), "");
    assert.equal(formatCertificateAmount(undefined), "");
    assert.equal(formatCertificateAmount(""), "");
    assert.equal(formatCertificateAmount(199, "USD"), "$199.00");
});

test("formats payment time and clamps negative or invalid values to zero", () => {
    assert.equal(formatPaymentTime(), "00:00");
    assert.equal(formatPaymentTime(0), "00:00");
    assert.equal(formatPaymentTime(125), "02:05");
    assert.equal(formatPaymentTime(-5), "00:00");
    assert.equal(formatPaymentTime("invalid"), "00:00");
    assert.equal(formatPaymentTime(6000), "100:00");
});
