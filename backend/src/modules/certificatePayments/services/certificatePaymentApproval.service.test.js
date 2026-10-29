import assert from "node:assert/strict";
import test from "node:test";

import CertificatePayment from "../models/CertificatePayment.js";
import {
    approveCertificatePayment,
    rejectCertificatePayment,
} from "./certificatePaymentApproval.service.js";

test("approval requires an existing payment awaiting admin review", async (t) => {
    t.mock.method(CertificatePayment, "findById", async () => null);

    await assert.rejects(
        approveCertificatePayment("missing-payment", "admin-1", Buffer.from("image")),
        (error) => error.statusCode === 404
    );

    t.mock.method(CertificatePayment, "findById", async () => ({
        status: "created",
    }));

    await assert.rejects(
        approveCertificatePayment("payment-1", "admin-1", Buffer.from("image")),
        (error) => error.statusCode === 400
    );
});

test("rejection requires an existing payment awaiting review and a reason", async (t) => {
    t.mock.method(CertificatePayment, "findById", async () => null);

    await assert.rejects(
        rejectCertificatePayment("missing-payment", "admin-1", "Invalid payment"),
        (error) => error.statusCode === 404
    );

    t.mock.method(CertificatePayment, "findById", async () => ({
        status: "created",
    }));

    await assert.rejects(
        rejectCertificatePayment("payment-1", "admin-1", "Invalid payment"),
        (error) => error.statusCode === 400
    );
});

test("rejects approval-pending payments when the rejection reason is blank", async (t) => {
    t.mock.method(CertificatePayment, "findById", async () => ({
        status: "approval_pending",
    }));

    await assert.rejects(
        rejectCertificatePayment("payment-1", "admin-1", "  "),
        (error) => error.statusCode === 400
    );
});
