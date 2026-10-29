import assert from "node:assert/strict";
import test from "node:test";

import Course from "./Course.js";

const validCourse = {
    title: "Test Course",
    slug: "test-course",
    category: "Development",
    description: "Test course description",
    duration: "1 month",
    price: 25
};

test("defaults offer to zero for existing or new courses without an offer", async () => {
    const course = new Course(validCourse);
    const existingCourse = Course.hydrate({
        ...validCourse,
        _id: new Course()._id
    });

    assert.equal(course.offer, 0);
    assert.equal(existingCourse.offer, 0);
    await assert.doesNotReject(course.validate());
});

test("accepts whole-number offers at the allowed boundaries", async () => {
    for (const offer of [0, 100]) {
        const course = new Course({
            ...validCourse,
            offer
        });

        await assert.doesNotReject(course.validate());
    }
});

test("casts submitted offer strings to whole-number values", async () => {
    const course = new Course({
        ...validCourse,
        offer: "37"
    });

    await course.validate();
    assert.equal(course.offer, 37);
});

test("rejects fractional and out-of-range offers", async () => {
    for (const offer of [-1, 100.5, 101]) {
        const course = new Course({
            ...validCourse,
            offer
        });

        await assert.rejects(
            course.validate(),
            (error) => Boolean(error.errors.offer)
        );
    }
});
