import { z } from "zod";

const baseFeedbackSchema = z.object({
    type: z.enum(["website", "course", "internship", "bug"]),
    subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(150, "Subject is too long"),
    message: z.string().trim().min(10, "Feedback must be at least 10 characters").max(3000, "Feedback is too long"),
    rating: z.coerce.number().int("Rating must be a whole number").min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5").optional(),
    courseId: z.string().trim().optional(),
    internshipId: z.string().trim().optional()
}).superRefine((data, ctx) => {
    if (data.type !== "bug" && data.rating == null) {
        ctx.addIssue({ code: "custom", path: ["rating"], message: "Rating is required" });
    }

    if (data.type === "bug" && data.rating != null) {
        ctx.addIssue({ code: "custom", path: ["rating"], message: "Rating is not allowed for bug feedback" });
    }

    if (data.type === "course" && !data.courseId) {
        ctx.addIssue({ code: "custom", path: ["courseId"], message: "Course is required for course feedback" });
    }

    if (data.type === "internship" && !data.internshipId) {
        ctx.addIssue({ code: "custom", path: ["internshipId"], message: "Internship is required for internship feedback" });
    }

    if (data.type !== "course" && data.courseId) {
        ctx.addIssue({ code: "custom", path: ["courseId"], message: "Course is only allowed for course feedback" });
    }

    if (data.type !== "internship" && data.internshipId) {
        ctx.addIssue({ code: "custom", path: ["internshipId"], message: "Internship is only allowed for internship feedback" });
    }
});

export { baseFeedbackSchema };
