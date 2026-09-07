export const INITIAL_FEEDBACK_FORM = {
    subject: "",
    message: "",
    rating: 0,
    courseId: "",
    internshipId: "",
};

export function buildFeedbackPayload(type, form) {
    const payload = {
        type,
        subject: form.subject.trim(),
        message: form.message.trim(),
    };

    if (type !== "bug") {
        payload.rating = form.rating;
    }

    if (type === "course") {
        payload.courseId = form.courseId;
    }

    if (type === "internship") {
        payload.internshipId = form.internshipId;
    }

    return payload;
}

export function getResourceOptions(resources) {
    return resources.map((resource) => ({
        value:
            resource.course?._id ||
            resource.internship?._id ||
            resource._id,
        label:
            resource.course?.title ||
            resource.internship?.title ||
            resource.title,
    }));
}
