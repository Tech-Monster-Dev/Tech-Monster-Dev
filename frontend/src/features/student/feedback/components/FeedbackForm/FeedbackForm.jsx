import { useState } from "react";
import { toast } from "react-toastify";
import Input from "../../../../../components/ui/Input";
import Select from "../../../../../components/ui/Select";
import TextArea from "../../../../../components/ui/TextArea";
import Button from "../../../../../components/ui/Button";
import FeedbackRating from "../FeedbackRating";
import { submitFeedback } from "../../../../../services/api/feedback.service";
import { INITIAL_FEEDBACK_FORM, buildFeedbackPayload, getResourceOptions } from "../../utils/feedback";
import { validateFeedbackForm } from "../../utils/feedback.validation";
import "./FeedbackForm.css";



export default function FeedbackForm({
    type,
    title,
    description,
    resources = [],
    onSubmitted,
}) {
    const [form, setForm] = useState(INITIAL_FEEDBACK_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const resourceOptions = getResourceOptions(resources);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        setErrors((current) => ({
            ...current,
            [name]: "",
        }));
    };

    const handleRatingChange = (rating) => {
        setForm((current) => ({
            ...current,
            rating,
        }));

        setErrors((current) => ({
            ...current,
            rating: "",
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateFeedbackForm(type, form);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setSubmitting(true);

            const payload = buildFeedbackPayload(type, form);

            const response = await submitFeedback(payload);

            if (response?.success === false) {
                throw new Error(response.message || "Unable to submit feedback");
            }

            toast.success("Feedback submitted successfully.");
            setForm(INITIAL_FEEDBACK_FORM);
            setErrors({});
            onSubmitted?.();
        } catch (error) {
            console.error("Feedback submission error:", error);
            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "Unable to submit feedback."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="feedback-form-heading">
                <h2>{title}</h2>

                {description && <p>{description}</p>}
            </div>

            {type === "course" && (
                <Select
                    label="Course"
                    name="courseId"
                    value={form.courseId}
                    onChange={handleChange}
                    options={resourceOptions}
                    placeholder="Select a course"
                    error={errors.courseId}
                    required
                    disabled={submitting}
                />
            )}

            {type === "internship" && (
                <Select
                    label="Internship"
                    name="internshipId"
                    value={form.internshipId}
                    onChange={handleChange}
                    options={resourceOptions}
                    placeholder="Select an internship"
                    error={errors.internshipId}
                    required
                    disabled={submitting}
                />
            )}

            <Input
                label="Subject"
                name="subject"
                value={form.subject}
                placeholder="Enter a short subject"
                onChange={handleChange}
                error={errors.subject}
                required
                maxLength={150}
                disabled={submitting}
            />

            <TextArea
                label="Feedback"
                name="message"
                value={form.message}
                placeholder="Share your experience, suggestion, or issue..."
                onChange={handleChange}
                error={errors.message}
                rows={6}
                maxLength={3000}
                disabled={submitting}
            />

            {type !== "bug" && (
                <FeedbackRating
                    value={form.rating}
                    onChange={handleRatingChange}
                    error={errors.rating}
                />
            )}

            <div className="feedback-form-actions">
                <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Feedback"}
                </Button>
            </div>
        </form>
    );
}
