import { useState } from "react";
import { toast } from "react-toastify";

import Form from "../../../../../components/ui/Form";
import DashButton from "../../../../../components/ui/Button/DashButton";
import Rating from "../../../../../components/ui/Form/component/Rating";
import { submitFeedback } from "../../../../../services/api/feedback.service";
import {
    INITIAL_FEEDBACK_FORM,
    buildFeedbackPayload,
    getResourceOptions,
} from "../../utils/feedback";
import {
    validateField,
    validateForm,
} from "../../../../../shared/utils/validation/formValidation";

import "./FeedbackForm.css";

const feedbackValidationRules = {
    subject: {
        required: true,
        requiredMessage: "Subject field is required",
        minLength: 3,
        minLengthMessage: "Subject must be at least 3 characters",
    },
    message: {
        required: true,
        requiredMessage: "Message is required",
        minLength: 10,
        minLengthMessage: "Feedback must be at least 10 characters",
    },
    rating: {
        required: true,
        requiredMessage: "Please select a rating",
    },
    courseId: {
        required: true,
        requiredMessage: "Please select a course",
    },
    internshipId: {
        required: true,
        requiredMessage: "Please select an internship",
    },
};

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

    const validationRules = {
        subject: feedbackValidationRules.subject,
        message: feedbackValidationRules.message,
        ...(type !== "bug" && {
            rating: feedbackValidationRules.rating,
        }),
        ...(type === "course" && {
            courseId: feedbackValidationRules.courseId,
        }),
        ...(type === "internship" && {
            internshipId: feedbackValidationRules.internshipId,
        }),
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        setErrors((current) => ({
            ...current,
            [name]: validateField(
                name,
                value,
                validationRules
            ),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const {
            errors: validationErrors,
            isValid,
        } = validateForm(
            form,
            validationRules
        );

        setErrors(validationErrors);

        if (!isValid) {
            return;
        }

        try {
            setSubmitting(true);

            const payload = buildFeedbackPayload(type, form);
            const response = await submitFeedback(payload);

            if (response?.success === false) {
                throw new Error(
                    response.message ||
                    "Unable to submit feedback"
                );
            }

            toast.success(
                "Feedback submitted successfully."
            );

            setForm(INITIAL_FEEDBACK_FORM);
            setErrors({});
            onSubmitted?.();
        } catch (error) {
            console.error(
                "Feedback submission error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Unable to submit feedback."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const fields = [
        ...(type === "course"
            ? [
                {
                    name: "courseId",
                    type: "select",
                    label: "Course",
                    value: form.courseId,
                    placeholder: "Select a course",
                    options: resourceOptions,
                    required: true,
                    disabled: submitting,
                },
            ]
            : []),

        ...(type === "internship"
            ? [
                {
                    name: "internshipId",
                    type: "select",
                    label: "Internship",
                    value: form.internshipId,
                    placeholder: "Select an internship",
                    options: resourceOptions,
                    required: true,
                    disabled: submitting,
                },
            ]
            : []),

        {
            name: "subject",
            type: "text",
            label: "Subject",
            value: form.subject,
            placeholder: "Enter a short subject",
            required: true,
            maxLength: 150,
            disabled: submitting,
        },

        {
            name: "message",
            type: "textarea",
            label: "Feedback",
            value: form.message,
            placeholder:
                "Share your experience, suggestion, or issue...",
            rows: 6,
            maxLength: 3000,
            required: true,
            disabled: submitting,
        },

        ...(type !== "bug"
            ? [
                {
                    name: "rating",
                    value: form.rating,
                    required: true,
                    render: ({
                        value,
                        error,
                        onChange,
                    }) => (
                        <Rating
                            rating={value}
                            max={5}
                            interactive
                            onChange={(rating) =>
                                onChange({
                                    target: {
                                        name: "rating",
                                        value: rating,
                                    },
                                })
                            }
                            error={error}
                            label="Rating"
                        />
                    ),
                },
            ]
            : []),
    ];

    const actions = [
        {
            component: DashButton,
            type: "submit",
            label: submitting
                ? "Submitting..."
                : "Submit Feedback",
            disabled: submitting,
        },
    ];

    return (
        <Form
            fields={fields}
            values={form}
            errors={errors}
            onChange={handleChange}
            onSubmit={handleSubmit}
            actions={actions}
            formClassName="feedback-form"
            noValidate
        >
            <div className="feedback-form-heading">
                <h2>{title}</h2>

                {description && (
                    <p>{description}</p>
                )}
            </div>
        </Form>
    );
}