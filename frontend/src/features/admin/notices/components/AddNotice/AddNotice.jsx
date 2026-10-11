import "./AddNotice.css";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Form from "../../../../../components/ui/Form";
import DashButton from "../../../../../components/ui/Button/DashButton/DashButton";

import { validateForm } from "../../../../../shared/utils/validation/formValidation";
import { createNotice, updateNotice } from "../../../../../services/api/notice.service";

const validationRules = {
    shortTitle: {
        required: true,
        requiredMessage: "Short title is required."
    },
    subject: {
        required: true,
        requiredMessage: "Notice subject is required."
    },
    description: {
        required: true,
        requiredMessage: "Notice description is required."
    },
};

export default function AddNotice({ editNotice = null, onSaved }) {
    const [formData, setFormData] = useState({
        shortTitle: "",
        subject: "",
        description: ""
    });
    const [errors, setErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const isEditMode = Boolean(editNotice?._id || editNotice?.id);

    useEffect(() => {
        queueMicrotask(() => {
            if (!editNotice) {
                setFormData({
                    shortTitle: "",
                    subject: "",
                    description: ""
                });
                setImageFile(null);
                setPreview("");
                setErrors({});
                return;
            }

            setFormData({
                shortTitle: editNotice.shortTitle || "",
                subject: editNotice.subject || "",
                description: editNotice.description || ""
            });
            setImageFile(null);
            setPreview(editNotice.image || "");
            setErrors({});
        });
    }, [editNotice]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        if (name === "img") {
            if (value instanceof File) {
                setImageFile(value);
                setPreview(value);
                setErrors((current) => ({ ...current, img: "" }));
            } else if (typeof value === "string" && value) {
                setImageFile(null);
                setPreview(value);
                setErrors((current) => ({ ...current, img: "" }));
            } else {
                setImageFile(null);
                setPreview("");
                setErrors((current) => ({
                    ...current,
                    img: "Notice image is required."
                }));
            }
            return;
        }

        const updatedFormData = { ...formData, [name]: value };
        setFormData(updatedFormData);

        if (Object.prototype.hasOwnProperty.call(errors, name)) {
            setErrors((current) => ({
                ...current,
                [name]: validateForm(updatedFormData, validationRules).errors[name]
            }));
        }
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        const validation = validateForm(
            { ...formData, img: imageFile || preview },
            validationRules
        );
        setErrors(validation.errors);

        if (!validation.isValid) return;

        const data = new FormData();
        data.append("shortTitle", formData.shortTitle);
        data.append("subject", formData.subject);
        data.append("description", formData.description);

        if (imageFile) {
            data.append("img", imageFile);
        }

        try {
            setSubmitting(true);

            const response = isEditMode
                ? await updateNotice(editNotice._id || editNotice.id, data)
                : await createNotice(data);

            if (!response?.success) {
                throw new Error(response?.message || "Failed to save notice.");
            }

            toast.success(
                isEditMode
                    ? "Notice updated successfully"
                    : "Notice created successfully"
            );
            onSaved?.(response.notice);
        } catch (error) {
            console.error("Error submitting notice:", error);
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const fields = [
        {
            name: "shortTitle",
            label: "Short Title",
            type: "text",
            placeholder: "Enter short title",
            required: true
        },
        {
            name: "subject",
            label: "Notice Subject",
            type: "text",
            placeholder: "Enter notice subject",
            required: true
        },
        {
            name: "description",
            label: "Notice Description",
            type: "textarea",
            placeholder: "Enter notice description",
            rows: 7,
            required: true
        },
        {
            name: "img",
            type: "file",
            label: "Image",
            accept: "image/*",
            value: imageFile || preview || "",
            placeholder: "Choose notice image",
        }
    ].map((field) => ({
        ...field,
        ...(field.name !== "img" ? {
            value: formData[field.name],
            error: errors[field.name]
        } : {})
    }));

    return (
        <Form
            className="admin-notice-form"
            fields={fields}
            values={formData}
            errors={errors}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            buttonComponent={DashButton}
            actions={[
                {
                    id: "save-notice",
                    type: "submit",
                    label: submitting
                        ? "Saving..."
                        : isEditMode
                            ? "Update Notice"
                            : "Save Notice",
                    variant: "primary",
                    disabled: submitting,
                    loading: submitting,
                    loadingText: "Saving...",
                    className: "admin-notice-submit"
                }
            ]}
        />
    );
}