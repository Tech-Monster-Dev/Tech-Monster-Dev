import assert from "node:assert/strict";
import test from "node:test";

import { getStudentAttendanceSummary } from "./getAttendance.js";

const today = new Date("2026-10-29T12:00:00");

const getSummary = async ({ students, attendance }) => {
    let attendanceQuery;

    const result = await getStudentAttendanceSummary({
        UserModel: {
            distinct: async (field, query) => {
                assert.equal(field, "_id");
                assert.deepEqual(query, { role: "student" });
                return students;
            }
        },
        AttendanceModel: {
            distinct: async (field, query) => {
                assert.equal(field, "student");
                attendanceQuery = query;

                const eligibleStudents = new Set(
                    query.student.$in
                );
                return attendance.filter((record) =>
                    record.status === query.status &&
                    record.createdAt >= query.createdAt.$gte &&
                    record.createdAt < query.createdAt.$lt &&
                    eligibleStudents.has(record.student)
                ).map((record) => record.student).filter(
                    (student, index, present) =>
                        present.indexOf(student) === index
                );
            }
        },
        now: today
    });

    return {
        ...result,
        attendanceQuery
    };
};

test("counts a present student", async () => {
    const result = await getSummary({
        students: ["student-1"],
        attendance: [{
            student: "student-1",
            status: "Present",
            createdAt: new Date("2026-10-29T09:00:00")
        }]
    });

    assert.deepEqual(
        {
            totalStudents: result.totalStudents,
            present: result.present,
            absent: result.absent,
            attendancePercentage: result.attendancePercentage
        },
        {
            totalStudents: 1,
            present: 1,
            absent: 0,
            attendancePercentage: 100
        }
    );
    assert.deepEqual(result.attendanceQuery.student.$in, ["student-1"]);
});

test("counts a student without a present record as absent", async () => {
    const result = await getSummary({
        students: ["student-1"],
        attendance: [{
            student: "student-1",
            status: "Absent",
            createdAt: new Date("2026-10-29T09:00:00")
        }]
    });

    assert.deepEqual(
        {
            totalStudents: result.totalStudents,
            present: result.present,
            absent: result.absent,
            attendancePercentage: result.attendancePercentage
        },
        {
            totalStudents: 1,
            present: 0,
            absent: 1,
            attendancePercentage: 0
        }
    );
});

test("does not count an admin attendance record as Present", async () => {
    const result = await getSummary({
        students: [],
        attendance: [{
            student: "admin-1",
            status: "Present",
            createdAt: new Date("2026-10-29T09:00:00")
        }]
    });

    assert.deepEqual(
        {
            totalStudents: result.totalStudents,
            present: result.present,
            absent: result.absent,
            attendancePercentage: result.attendancePercentage
        },
        {
            totalStudents: 0,
            present: 0,
            absent: 0,
            attendancePercentage: 0
        }
    );
    assert.equal(result.attendanceQuery, undefined);
});

test("counts mixed student/admin records using only student attendance", async () => {
    const result = await getSummary({
        students: ["student-1", "student-2"],
        attendance: [
            {
                student: "student-1",
                status: "Present",
                createdAt: new Date("2026-10-29T09:00:00")
            },
            {
                student: "admin-1",
                status: "Present",
                createdAt: new Date("2026-10-29T09:00:00")
            }
        ]
    });

    assert.deepEqual(
        {
            totalStudents: result.totalStudents,
            present: result.present,
            absent: result.absent,
            attendancePercentage: result.attendancePercentage
        },
        {
            totalStudents: 2,
            present: 1,
            absent: 1,
            attendancePercentage: 50
        }
    );
    assert.deepEqual(
        result.attendanceQuery.student.$in,
        ["student-1", "student-2"]
    );
});

test("returns zero counts when students have no attendance records", async () => {
    const result = await getSummary({
        students: ["student-1", "student-2"],
        attendance: []
    });

    assert.deepEqual(
        {
            totalStudents: result.totalStudents,
            present: result.present,
            absent: result.absent,
            attendancePercentage: result.attendancePercentage
        },
        {
            totalStudents: 2,
            present: 0,
            absent: 2,
            attendancePercentage: 0
        }
    );
});
