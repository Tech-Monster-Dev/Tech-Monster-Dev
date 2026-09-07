export function validateFeedbackForm(type, form) {
    const errors = {};

    if (form.subject.trim().length < 3) {
        errors.subject = "Subject must be at least 3 characters";
    }

    if (form.message.trim().length < 10) {
        errors.message = "Feedback must be at least 10 characters";
    }

    if (type !== "bug" && !form.rating) {
        errors.rating = "Please select a rating";
    }

    if (type === "course" && !form.courseId) {
        errors.courseId = "Please select a course";
    }

    if (type === "internship" && !form.internshipId) {
        errors.internshipId = "Please select an internship";
    }

    return errors;
}
