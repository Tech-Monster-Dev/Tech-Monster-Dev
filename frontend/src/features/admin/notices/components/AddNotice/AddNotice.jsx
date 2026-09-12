import { useEffect, useState } from "react";

import { toast } from "react-toastify";

import Button from "../../../../../components/ui/Button";
import Textinput from "../../../../../components/ui/Form/component/Textinput";
import TextArea from "../../../../../components/ui/Form/component/TextArea";

import "./AddNotice.css";

import { createNotice, updateNotice } from "../../../../../services/api/notice.service";

export default function AddNotice({ editNotice = null, onSaved }) {
    const [formData, setFormData] = useState({
        shortTitle: "",
        subject: "",
        description: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const isEditMode = Boolean(editNotice?._id || editNotice?.id);

    useEffect(() => {
        if (Boolean(editNotice) === false) {
            return;
        }

        queueMicrotask(() => {
            setFormData({
                shortTitle: editNotice.shortTitle || "",
                subject: editNotice.subject || "",
                description: editNotice.description || "",
            });
            setImageFile(null);
            setPreview(editNotice.image || "");
        });
    }, [editNotice]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

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

    return (
        <form className="admin-notice-form" onSubmit={handleSubmit}>
            <Textinput
                label="Short Title"
                type="text"
                name="shortTitle"
                value={formData.shortTitle}
                onChange={handleInputChange}
                placeholder="Enter short title"
                required
            />

            <Textinput
                label="Notice Subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter notice subject"
                required
            />

            <TextArea
                label="Notice Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter notice description"
                rows={7}
                required
            />

            <div className="admin-notice-image-field">
                <label htmlFor="notice-image">Image</label>
                <input
                    id="notice-image"
                    name="img"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                {preview && (
                    <img
                        className="admin-notice-image-preview"
                        src={preview}
                        alt="Notice preview"
                    />
                )}
            </div>

            <Button
                type="submit"
                variant="primary"
                disabled={submitting}
            >
                {submitting
                    ? "Saving..."
                    : isEditMode
                        ? "Update Notice"
                        : "Save Notice"}
            </Button>
        </form>
    );
}
