// Admin student action buttons

import "./StudentActionButtons.css";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
    FiEye,
    FiEdit,
    FiBell,
    FiSlash,
    FiTrash2
} from "react-icons/fi";

import {
    blockStudent,
    unblockStudent,
    deleteStudent,
    restoreStudent
} from "../../../../../services/api/adminStudentService";

export default function StudentActionButtons({

    student,

    onRefresh,

    onEdit,

    onNotify

}) {

    const navigate = useNavigate();

    const handleBlock = async () => {

        try {

            if (student.isBlocked) {

                await unblockStudent(student._id);

                toast.success("Student Unblocked");

            } else {

                await blockStudent(student._id);

                toast.success("Student Blocked");

            }

            onRefresh();

        } catch (err) {

            toast.error(err.response?.data?.message);

        }

    };

    const handleDelete = async () => {

        const confirmDelete = window.confirm(
            "Delete this student?"
        );

        if (!confirmDelete) return;

        try {

            await deleteStudent(student._id);

            toast.success("Student Deleted");

            onRefresh();

        } catch (err) {

            toast.error(err.response?.data?.message);

        }

    };

    if (student.isDeleted) {

        const handleRestore = async () => {

            const confirmRestore = window.confirm(
                "Restore this student and all backed-up data?"
            );

            if (!confirmRestore) return;

            try {

                await restoreStudent(student._id);

                toast.success("Student Restored");

                onRefresh();

            } catch (err) {

                toast.error(err.response?.data?.message);

            }

        };

        return (

            <div className="studentActionButtons">

                <button
                    className="restoreBtn"
                    onClick={handleRestore}
                >
                    Restore
                </button>

            </div>

        );

    }

    return (

        <div className="studentActionButtons">

            <button
                className="viewBtn"
                onClick={() =>
                    navigate(`/admin/students/${student._id}`)
                }
            >
                <FiEye />
            </button>

            <button
                className="editBtn"
                onClick={() => onEdit(student)}
            >
                <FiEdit />
            </button>

            <button
                className="notifyBtn"
                onClick={() => onNotify(student)}
            >
                <FiBell />
            </button>

            <button
                className="blockBtn"
                onClick={handleBlock}
            >
                <FiSlash />
            </button>

            <button
                className="deleteBtn"
                onClick={handleDelete}
            >
                <FiTrash2 />
            </button>

        </div>

    );

}