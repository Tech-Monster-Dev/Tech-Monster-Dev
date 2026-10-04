import "./EditStudentModal.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Form from "../../../../../components/ui/Form";
import BackButton from "../../../../../components/ui/Button/BackButton/BackButton";
import DashButton from "../../../../../components/ui/Button/DashButton/DashButton";
import { updateStudent } from "../../../../../services/api/adminStudentService";

export default function EditStudentModal({
    open,
    student,
    onClose,
    onRefresh,
}) {
    const navigate = useNavigate();
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (student) {
            queueMicrotask(() => {
                setForm({ ...student });
            });
        }
    }, [student]);

    if (!open) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const goToStudents = () => {
        onClose?.();
        navigate("/admin/students");
    };

    const handleOverlayMouseDown = (event) => {
        if (event.target === event.currentTarget) {
            goToStudents();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!student?._id || saving) return;

        try {
            setSaving(true);
            await updateStudent(student._id, form);
            toast.success("Student Updated Successfully");
            await onRefresh?.();
            goToStudents();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Update Failed"
            );
        } finally {
            setSaving(false);
        }
    };

    const fields = [
        {
            name: "firstName",
            label: "First Name",
            placeholder: "Enter first name",
        },
        {
            name: "lastName",
            label: "Last Name",
            placeholder: "Enter last name",
        },
        {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "Enter email",
        },
        {
            name: "phone",
            label: "Phone",
            type: "tel",
            placeholder: "Enter phone number",
        },
        {
            name: "college",
            label: "College",
            placeholder: "Enter college",
        },
        {
            name: "branch",
            label: "Branch",
            placeholder: "Enter branch",
        },
        {
            name: "year",
            label: "Year",
            placeholder: "Enter year",
        },
        {
            name: "semester",
            label: "Semester",
            placeholder: "Enter semester",
        },
        {
            name: "bio",
            label: "Bio",
            type: "textarea",
            rows: 5,
            placeholder: "Enter student bio",
            wrapperClassName: "editStudentBioField",
        },
    ];

    return (
        <div
            className="editStudentOverlay"
            onMouseDown={handleOverlayMouseDown}
            role="presentation"
        >
            <section
                className="editStudentModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-student-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <BackButton
                    to="/admin/students"
                    label="Back to Manage Students"
                    className="editStudentBackButton"
                    onClick={goToStudents}
                />

                <div className="editStudentHeader">
                    <div className="editStudentHeading">
                        <span className="editStudentEyebrow">Student Management</span>
                        <h2 id="edit-student-title">Edit Student</h2>
                        <p>Update the student's profile and education information.</p>
                    </div>
                </div>

                <Form
                    fields={fields}
                    values={form}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    formClassName="editStudentForm"
                    buttonComponent={DashButton}
                    actions={[
                        {
                            label: "Cancel",
                            type: "button",
                            variant: "ghost",
                            size: "medium",
                            onClick: goToStudents,
                        },
                        {
                            label: "Save Changes",
                            type: "submit",
                            variant: "primary",
                            size: "medium",
                            loading: saving,
                            loadingText: "Saving...",
                        },
                    ]}
                />
            </section>
        </div>
    );
}
