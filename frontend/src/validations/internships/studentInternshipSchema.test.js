import assert from "node:assert/strict";
import test from "node:test";

import studentInternshipSchema from "./studentInternshipSchema.js";

test("requires student and internship IDs and applies enrollment defaults", () => {
    const result = studentInternshipSchema.safeParse({
        student: " student-id ",
        internship: " internship-id ",
    });

    assert.equal(result.success, true);
    assert.deepEqual(result.data, {
        student: "student-id",
        internship: "internship-id",
        completedTasks: 0,
        progress: 0,
        status: "Not Started",
        certificateIssued: false,
    });
    assert.equal(
        studentInternshipSchema.safeParse({
            student: "",
            internship: "internship-id",
        }).success,
        false
    );
});

test("coerces numeric enrollment data and enforces progress boundaries", () => {
    const result = studentInternshipSchema.safeParse({
        student: "student-id",
        internship: "internship-id",
        completedTasks: "3",
        progress: "100",
        status: "Completed",
    });

    assert.equal(result.success, true);
    assert.equal(result.data.completedTasks, 3);
    assert.equal(result.data.progress, 100);
    assert.equal(result.data.status, "Completed");

    for (const progress of ["-1", "101", "not-a-number"]) {
        assert.equal(
            studentInternshipSchema.safeParse({
                student: "student-id",
                internship: "internship-id",
                progress,
            }).success,
            false
        );
    }

    assert.equal(
        studentInternshipSchema.safeParse({
            student: "student-id",
            internship: "internship-id",
            status: "Unknown",
        }).success,
        false
    );
});
