import assert from "node:assert/strict";
import test from "node:test";

import CertificatePayment from "./models/CertificatePayment.js";
import CertificateSequence from "../certificates/models/CertificateSequence.js";
import {
    cancelCertificatePayment,
    createCertificatePayment,
    getCompletedProgramForStudent,
    submitCertificatePayment,
} from "./certificatePayment.service.js";
import StudentInternship from "../internships/models/StudentInternship.js";

const completedEnrollmentQuery = (programType, program) => ({
    populate: async (path) => {
        assert.equal(path, programType);
        return { [programType]: program };
    },
});

test("requires exactly one completed program identifier", async (t) => {
    const findOne = t.mock.method(StudentInternship, "findOne", () => {
        throw new Error("Should not query enrollment");
    });

    await assert.rejects(
        getCompletedProgramForStudent("student-1"),
        (error) => error.statusCode === 400
    );
    await assert.rejects(
        getCompletedProgramForStudent("student-1", {
            courseId: "course-1",
            internshipId: "internship-1",
        }),
        (error) => error.statusCode === 400
    );
    assert.equal(findOne.mock.callCount(), 0);
});

test("requires a completed enrollment and an eligible certificate", async (t) => {
    let query;
    t.mock.method(StudentInternship, "findOne", (filter) => {
        query = filter;
        return completedEnrollmentQuery("course", null);
    });

    await assert.rejects(
        getCompletedProgramForStudent("student-1", {
            courseId: "course-1",
        }),
        (error) => error.statusCode === 404
    );
    assert.deepEqual(query, {
        student: "student-1",
        course: "course-1",
        status: "Completed",
    });

    t.mock.method(StudentInternship, "findOne", () =>
        completedEnrollmentQuery("course", {
            _id: "course-1",
            certificate: false,
            price: 199,
        })
    );

    await assert.rejects(
        getCompletedProgramForStudent("student-1", {
            courseId: "course-1",
        }),
        (error) => error.statusCode === 400
    );
});

test("resolves eligible course and internship payment data from their enrollment", async (t) => {
    const course = {
        _id: "course-1",
        title: "Test Course",
        price: 199,
        offer: 20,
        certificate: true,
    };
    t.mock.method(StudentInternship, "findOne", () =>
        completedEnrollmentQuery("course", course)
    );

    const result = await getCompletedProgramForStudent("student-1", {
        courseId: "course-1",
    });

    assert.deepEqual(result, {
        programType: "course",
        programId: "course-1",
        programTitle: "Test Course",
        amount: 159.2,
        course,
        internship: null,
    });

    t.mock.method(StudentInternship, "findOne", () =>
        completedEnrollmentQuery("internship", {
            _id: "internship-1",
            title: "Test Internship",
            price: 299,
            certificate: true,
        })
    );
    const internshipResult = await getCompletedProgramForStudent(
        "student-1",
        { internshipId: "internship-1" }
    );

    assert.equal(internshipResult.programType, "internship");
    assert.equal(internshipResult.amount, 299);
    assert.equal(internshipResult.course, null);
});

test("calculates course certificate amounts for discount boundaries and rounding", async (t) => {
    const cases = [
        { price: 199, offer: 0, expected: 199 },
        { price: 200, offer: 50, expected: 100 },
        { price: 199, offer: 100, expected: 0 },
        { price: 19.99, offer: 15, expected: 16.99 },
    ];

    for (const [index, scenario] of cases.entries()) {
        await t.test('case ' + (index + 1) + ': ' + scenario.offer + '% offer on ' + scenario.price, async (st) => {
            const course = {
                _id: 'course-' + index,
                title: 'Test Course',
                price: scenario.price,
                offer: scenario.offer,
                certificate: true,
            };
            st.mock.method(StudentInternship, 'findOne', () =>
                completedEnrollmentQuery('course', course)
            );

            const result = await getCompletedProgramForStudent('student-1', {
                courseId: course._id,
            });

            assert.equal(result.amount, scenario.expected);
        });
    }
});

test("reuses an existing paid certificate payment instead of creating another", async (t) => {
    const existingPayment = {
        _id: "payment-1",
        status: "approval_pending",
    };
    t.mock.method(StudentInternship, "findOne", () =>
        completedEnrollmentQuery("course", {
            _id: "course-1",
            title: "Test Course",
            price: 199,
            certificate: true,
        })
    );
    let paymentFilter;
    t.mock.method(CertificatePayment, "findOne", (filter) => {
        paymentFilter = filter;
        return {
            sort: async (sort) => {
                assert.deepEqual(sort, { createdAt: -1 });
                return existingPayment;
            },
        };
    });
    const create = t.mock.method(CertificatePayment, "create", () => {
        throw new Error("A second payment must not be created");
    });

    const result = await createCertificatePayment("student-1", {
        courseId: "course-1",
    });

    assert.equal(result.payment, existingPayment);
    assert.equal(result.reused, true);
    assert.equal(create.mock.callCount(), 0);
    assert.deepEqual(paymentFilter, {
        student: "student-1",
        course: "course-1",
        internship: null,
        status: {
            $in: [
                "created",
                "pending",
                "paid",
                "approval_pending",
                "approved",
            ],
        },
    });
});

test("expires an unusable checkout before creating a replacement", async (t) => {
    const expiredPayment = {
        _id: "payment-expired",
        status: "created",
        expiresAt: new Date(Date.now() - 1),
        save: async () => {
            expiredPayment.saved = true;
        },
    };
    const replacementPayment = { _id: "payment-new" };
    t.mock.method(StudentInternship, "findOne", () =>
        completedEnrollmentQuery("internship", {
            _id: "internship-1",
            title: "Test Internship",
            price: 1299,
            offer: 81,
            certificate: true,
        })
    );
    t.mock.method(CertificatePayment, "findOne", () => ({
        sort: async () => expiredPayment,
    }));
    let createData;
    t.mock.method(CertificatePayment, "create", async (data) => {
        createData = data;
        return replacementPayment;
    });

    const result = await createCertificatePayment("student-1", {
        internshipId: "internship-1",
    });

    assert.equal(expiredPayment.status, "expired");
    assert.equal(expiredPayment.saved, true);
    assert.equal(result.payment, replacementPayment);
    assert.equal(result.reused, false);
    assert.equal(createData.amount, 246.81);
    assert.equal(createData.gateway, "manual_qr");
    assert.ok(createData.expiresAt > new Date());
});

test("submits a valid manual payment for approval without changing its amount", async (t) => {
    const payment = {
        _id: "payment-1",
        student: "student-1",
        course: "course-1",
        programType: "course",
        programTitle: "Test Course",
        amount: 159.2,
        status: "created",
        expiresAt: new Date(Date.now() + 60_000),
        save: async () => {
            payment.saved = true;
        },
    };
    t.mock.method(CertificatePayment, "findOne", async (filter) => {
        assert.deepEqual(filter, {
            _id: "payment-1",
            student: "student-1",
        });
        return payment;
    });
    t.mock.method(StudentInternship, "findOne", () => ({
        select: async (fields) => {
            assert.equal(fields, "completedAt");
            return { completedAt: new Date("2025-05-01T00:00:00Z") };
        },
    }));

    let sequenceCalls = 0;
    t.mock.method(
        CertificateSequence,
        "findOneAndUpdate",
        async () => {
            sequenceCalls += 1;
            return sequenceCalls === 1
                ? null
                : { value: 42 };
        }
    );

    const result = await submitCertificatePayment(
        "student-1",
        "payment-1",
        "  Student Name  ",
        "  transaction-42  "
    );

    assert.equal(result, payment);
    assert.equal(payment.amount, 159.2);
    assert.equal(payment.status, "approval_pending");
    assert.equal(payment.payerName, "Student Name");
    assert.equal(payment.transactionId, "transaction-42");
    assert.equal(payment.certificateNumber, "TM-TC-2025-0042");
    assert.ok(payment.verificationToken);
    assert.ok(payment.paidAt instanceof Date);
    assert.equal(payment.saved, true);
});

test("rejects incomplete or expired payment submissions and persists expiry", async (t) => {
    const findPayment = t.mock.method(
        CertificatePayment,
        "findOne",
        async () => {
            throw new Error("Incomplete submission should not query payment");
        }
    );
    await assert.rejects(
        submitCertificatePayment("student-1", "payment-1", " ", "txn-1"),
        (error) => error.statusCode === 400
    );
    assert.equal(findPayment.mock.callCount(), 0);

    const expiredPayment = {
        _id: "payment-expired",
        student: "student-1",
        status: "pending",
        expiresAt: new Date(Date.now() - 1),
        save: async () => {
            expiredPayment.saved = true;
        },
    };
    t.mock.method(CertificatePayment, "findOne", async () => expiredPayment);

    await assert.rejects(
        submitCertificatePayment(
            "student-1",
            "payment-expired",
            "Student Name",
            "txn-1"
        ),
        (error) => error.statusCode === 410
    );
    assert.equal(expiredPayment.status, "expired");
    assert.equal(expiredPayment.saved, true);
});

test("cancels only the authenticated student's unpaid payment", async (t) => {
    const payment = {
        _id: "payment-1",
        status: "created",
        expiresAt: new Date(Date.now() + 60_000),
    };
    let query;
    t.mock.method(CertificatePayment, "findOne", (filter) => {
        query = filter;
        return payment;
    });
    const deletePayment = t.mock.method(
        CertificatePayment,
        "findByIdAndDelete",
        async (id) => {
            assert.equal(id, payment._id);
            return payment;
        }
    );

    const result = await cancelCertificatePayment(
        "student-1",
        "payment-1"
    );

    assert.equal(result.cancelled, true);
    assert.equal(result.paymentId, payment._id);
    assert.deepEqual(query, {
        _id: "payment-1",
        student: "student-1",
    });
    assert.equal(deletePayment.mock.callCount(), 1);
});

test("refuses cancellation of missing or already-submitted payments", async (t) => {
    t.mock.method(CertificatePayment, "findOne", async () => null);
    await assert.rejects(
        cancelCertificatePayment("student-1", "missing"),
        (error) => error.statusCode === 404
    );

    t.mock.method(CertificatePayment, "findOne", async () => ({
        _id: "payment-2",
        status: "approval_pending",
    }));
    const deletePayment = t.mock.method(
        CertificatePayment,
        "findByIdAndDelete",
        async () => {
            throw new Error("Submitted payments must not be deleted");
        }
    );

    await assert.rejects(
        cancelCertificatePayment("student-1", "payment-2"),
        (error) => error.statusCode === 400
    );
    assert.equal(deletePayment.mock.callCount(), 0);
});

test("expires and preserves payment records when cancellation is too late", async (t) => {
    const expiredPayment = {
        _id: "payment-3",
        status: "pending",
        expiresAt: new Date(Date.now() - 1),
        save: async () => {
            expiredPayment.saved = true;
        },
    };
    t.mock.method(CertificatePayment, "findOne", async () => expiredPayment);
    const deletePayment = t.mock.method(
        CertificatePayment,
        "findByIdAndDelete",
        async () => {
            throw new Error("Expired payments should be retained");
        }
    );

    await assert.rejects(
        cancelCertificatePayment("student-1", "payment-3"),
        (error) => error.statusCode === 410
    );
    assert.equal(expiredPayment.status, "expired");
    assert.equal(expiredPayment.saved, true);
    assert.equal(deletePayment.mock.callCount(), 0);
});
