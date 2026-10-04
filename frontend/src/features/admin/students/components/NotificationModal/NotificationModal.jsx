import "./NotificationModal.css";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Form from "../../../../../components/ui/Form";
import BackButton from "../../../../../components/ui/Button/BackButton/BackButton";
import DashButton from "../../../../../components/ui/Button/DashButton/DashButton";
import { validateField, validateForm } from "../../../../../shared/utils/validation/formValidation";
import api from "../../../../../services/api/axios";

const validationRules = {
    title: {
        required: true,
        requiredMessage: "Notification title is required",
        minLength: 3,
        minLengthMessage: "Title must be at least 3 characters",
        maxLength: 120,
        maxLengthMessage: "Title cannot exceed 120 characters",
    },
    message: {
        required: true,
        requiredMessage: "Notification message is required",
        minLength: 5,
        minLengthMessage: "Message must be at least 5 characters",
        maxLength: 1000,
        maxLengthMessage: "Message cannot exceed 1000 characters",
    },
};

export default function NotificationModal({
    open,
    student,
    onClose,
}) {
    const [form, setForm] = useState({
        title: "",
        message: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setForm({
                title: "",
                message: "",
            });
            setErrors({});
            setLoading(false);
        }
    }, [open]);

    if (!open || !student) return null;

    const closeModal = () => {
        if (loading) return;
        onClose?.();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        setErrors((current) => ({
            ...current,
            [name]: validateField(name, value, validationRules),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validation = validateForm(form, validationRules);

        setErrors(validation.errors);

        if (!validation.isValid || loading) {
            return;
        }

        try {
            setLoading(true);

            await api.post("/notifications", {
                user: student._id,
                title: form.title.trim(),
                message: form.message.trim(),
                type: "system",
            });

            toast.success("Notification Sent");

            setForm({
                title: "",
                message: "",
            });

            setErrors({});
            onClose?.();
        } catch (err) {
            console.log(err.response?.data);

            toast.error(
                err.response?.data?.message ||
                "Failed to send notification"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayMouseDown = (event) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    };

    const fields = [
        {
            name: "title",
            label: "Notification Title",
            placeholder: "Enter notification title",
            required: true,
            maxLength: 120,
        },
        {
            name: "message",
            label: "Notification Message",
            type: "textarea",
            rows: 7,
            placeholder: "Enter notification message",
            required: true,
            maxLength: 1000,
            wrapperClassName: "notificationMessageField",
        },
    ];

    const studentName = [
        student.firstName,
        student.middleName,
        student.lastName,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            className="notifyOverlay"
            onMouseDown={handleOverlayMouseDown}
            role="presentation"
        >
            <section
                className="notifyModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="notification-modal-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <BackButton
                    to="/admin/students"
                    label="Back to Manage Students"
                    className="notifyBackButton"
                    onClick={closeModal}
                />

                <div className="notifyHeader">
                    <div className="notifyHeading">
                        <span className="notifyEyebrow">
                            Student Communication
                        </span>

                        <h2 id="notification-modal-title">
                            Send Notification
                        </h2>

                        <p>
                            Send a notification to{" "}
                            <strong>{studentName || "this student"}</strong>.
                        </p>
                    </div>
                </div>

                <Form
                    fields={fields}
                    values={form}
                    errors={errors}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    formClassName="notifyForm"
                    buttonComponent={DashButton}
                    actions={[
                        {
                            label: "Cancel",
                            type: "button",
                            variant: "ghost",
                            size: "medium",
                            onClick: closeModal,
                        },
                        {
                            label: "Send Notification",
                            type: "submit",
                            variant: "primary",
                            size: "medium",
                            loading,
                            loadingText: "Sending...",
                        },
                    ]}
                />
            </section>
        </div>
    );
}
