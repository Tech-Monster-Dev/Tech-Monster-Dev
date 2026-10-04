import "./EditStudentModal.css";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { updateStudent } from "../../../../../services/api/adminStudentService";

export default function EditStudentModal({
    open,
    student,
    onClose,
    onRefresh
}) {

    const [form, setForm] = useState({});

    useEffect(() => {
        if (student) {
            queueMicrotask(() => {
                setForm(student);
            });
        }
    }, [student]);

    if (!open) return null;

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateStudent(student._id, form);
            toast.success("Student Updated Successfully");
            onRefresh();
            onClose();

        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Update Failed"
            );
        }
    };

    return (
        <div className="editStudentOverlay">
            <div className="editStudentModal">
                <h2>Edit Student</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        name="firstName"
                        placeholder="First Name"
                        value={form.firstName || ""}
                        onChange={handleChange}
                    />

                    <input
                        name="lastName"
                        placeholder="Last Name"
                        value={form.lastName || ""}
                        onChange={handleChange}
                    />

                    <input
                        name="email"
                        placeholder="Email"
                        value={form.email || ""}
                        onChange={handleChange}
                    />

                    <input
                        name="phone"
                        placeholder="Phone"
                        value={form.phone || ""}
                        onChange={handleChange}
                    />

                    <input
                        name="college"
                        placeholder="College"
                        value={form.college || ""}
                        onChange={handleChange}
                    />

                    <input
                        name="branch"
                        placeholder="Branch"
                        value={form.branch || ""}
                        onChange={handleChange}
                    />

                    <input
                        name="year"
                        placeholder="Year"
                        value={form.year || ""}
                        onChange={handleChange}
                    />

                    <input
                        name="semester"
                        placeholder="Semester"
                        value={form.semester || ""}
                        onChange={handleChange}
                    />

                    <textarea
                        name="bio"
                        placeholder="Bio"
                        value={form.bio || ""}
                        onChange={handleChange}
                    />

                    <div className="editStudentBtns">
                        <button
                            type="button"
                            className="cancelBtn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="saveBtn"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}