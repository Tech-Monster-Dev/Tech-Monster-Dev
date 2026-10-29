import assert from "node:assert/strict";
import test from "node:test";

import StudentInternship from "./StudentInternship.js";

const objectId = () => new StudentInternship()._id;

test("applies enrollment defaults for valid course and internship records", async () => {
    const courseEnrollment = new StudentInternship({
        student: objectId(),
        course: objectId(),
    });
    const internshipEnrollment = new StudentInternship({
        student: objectId(),
        internship: objectId(),
    });

    await assert.doesNotReject(courseEnrollment.validate());
    await assert.doesNotReject(internshipEnrollment.validate());
    assert.equal(courseEnrollment.status, "Not Started");
    assert.equal(courseEnrollment.progress, 0);
    assert.equal(courseEnrollment.completedTasks, 0);
    assert.deepEqual(courseEnrollment.completedLessons, []);
    assert.equal(courseEnrollment.certificateIssued, false);
    assert.equal(internshipEnrollment.status, "Not Started");
    assert.equal(internshipEnrollment.emailFlags.joinedEmailSent, false);
});

test("requires exactly one course or internship enrollment", async () => {
    const noProgram = new StudentInternship({
        student: objectId(),
    });
    const bothPrograms = new StudentInternship({
        student: objectId(),
        course: objectId(),
        internship: objectId(),
    });

    await assert.rejects(noProgram.validate());
    await assert.rejects(bothPrograms.validate());
});

test("enforces enrollment status values", async () => {
    const enrollment = new StudentInternship({
        student: objectId(),
        internship: objectId(),
        status: "Archived",
    });

    await assert.rejects(
        enrollment.validate(),
        (error) => Boolean(error.errors.status)
    );
});
