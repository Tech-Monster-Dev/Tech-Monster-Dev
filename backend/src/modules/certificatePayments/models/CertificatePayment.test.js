import assert from "node:assert/strict";
import test from "node:test";

import CertificatePayment from "./CertificatePayment.js";

const objectId = () => new CertificatePayment()._id;

const validCoursePayment = () => ({
    student: objectId(),
    course: objectId(),
    programType: "course",
    programTitle: "Test Course",
    amount: 199,
});

test("applies safe payment defaults and accepts a valid course payment", async () => {
    const payment = new CertificatePayment(validCoursePayment());

    await assert.doesNotReject(payment.validate());
    assert.equal(payment.internship, null);
    assert.equal(payment.currency, "INR");
    assert.equal(payment.gateway, "manual_qr");
    assert.equal(payment.status, "created");
    assert.equal(payment.payerName, "");
    assert.equal(payment.transactionId, "");
});

test("requires exactly one program matching the payment program type", async () => {
    const noProgram = new CertificatePayment({
        student: objectId(),
        programType: "course",
        programTitle: "Test Course",
        amount: 199,
    });
    const bothPrograms = new CertificatePayment({
        ...validCoursePayment(),
        internship: objectId(),
    });
    const mismatchedType = new CertificatePayment({
        ...validCoursePayment(),
        programType: "internship",
    });

    for (const payment of [noProgram, bothPrograms, mismatchedType]) {
        await assert.rejects(payment.validate());
    }
});

test("rejects invalid payment states and negative amounts", async () => {
    const invalidStatus = new CertificatePayment({
        ...validCoursePayment(),
        status: "complete",
    });
    const negativeAmount = new CertificatePayment({
        ...validCoursePayment(),
        amount: -1,
    });

    await assert.rejects(
        invalidStatus.validate(),
        (error) => Boolean(error.errors.status)
    );
    await assert.rejects(
        negativeAmount.validate(),
        (error) => Boolean(error.errors.amount)
    );
});
