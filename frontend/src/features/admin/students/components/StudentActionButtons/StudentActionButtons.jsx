import "./StudentActionButtons.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
    FiEye,
    FiEdit,
    FiBell,
    FiSlash,
    FiTrash2
} from "react-icons/fi";

import Warning from "../../../../../components/ui/Warning";
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

    const [showBlockWarning, setShowBlockWarning] = useState(false);
    const [blocking, setBlocking] = useState(false);

    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [showRestoreWarning, setShowRestoreWarning] = useState(false);
    const [restoring, setRestoring] = useState(false);

    const getStudentName = () =>
        [
            student?.firstName,
            student?.middleName,
            student?.lastName
        ]
            .filter(Boolean)
            .join(" ") ||
        student?.username ||
        "this student";

    const handleBlock = async () => {
        if (student.isBlocked) {
            try {
                await unblockStudent(student._id);
                toast.success("Student Unblocked");
                await onRefresh?.();
            } catch (err) {
                toast.error(
                    err.response?.data?.message ||
                    "Failed to unblock student"
                );
            }

            return;
        }

        setShowBlockWarning(true);
    };

    const handleCancelBlock = () => {
        if (blocking) return;
        setShowBlockWarning(false);
    };

    const handleConfirmBlock = async () => {
        if (blocking || student.isBlocked) return;

        try {
            setBlocking(true);

            await blockStudent(student._id);

            toast.success("Student Blocked");

            setShowBlockWarning(false);

            await onRefresh?.();
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Failed to block student"
            );
        } finally {
            setBlocking(false);
        }
    };

    const handleDelete = () => {
        if (deleting) return;

        setShowDeleteWarning(true);
    };

    const handleCancelDelete = () => {
        if (deleting) return;

        setShowDeleteWarning(false);
    };

    const handleConfirmDelete = async () => {
        if (deleting || !student?._id) return;

        try {
            setDeleting(true);

            await deleteStudent(student._id);

            toast.success("Student Deleted");

            setShowDeleteWarning(false);

            await onRefresh?.();
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Failed to delete student"
            );
        } finally {
            setDeleting(false);
        }
    };

    const handleRestore = () => {
        if (restoring) return;

        setShowRestoreWarning(true);
    };

    const handleCancelRestore = () => {
        if (restoring) return;

        setShowRestoreWarning(false);
    };

    const handleConfirmRestore = async () => {
        if (restoring || !student?._id) return;

        try {
            setRestoring(true);

            await restoreStudent(student._id);

            toast.success("Student Restored");

            setShowRestoreWarning(false);

            await onRefresh?.();
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Failed to restore student"
            );
        } finally {
            setRestoring(false);
        }
    };

    if (student.isDeleted) {
        return (
            <>
                <div className="studentActionButtons restoreActions">
                    <button
                        type="button"
                        className="restoreBtn"
                        onClick={handleRestore}
                    >
                        {restoring ? "Restoring..." : "Restore"}
                    </button>
                </div>

                <Warning
                    open={showRestoreWarning}
                    title="Restore Student?"
                    message={"Are you sure you want to restore " + getStudentName() + " and all backed-up data?"}
                    confirmText={
                        restoring ? "Restoring..." : "Confirm Restore"
                    }
                    cancelText="Cancel"
                    onCancel={handleCancelRestore}
                    onConfirm={handleConfirmRestore}
                />
            </>
        );
    }

    return (
        <>
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

            <Warning
                open={showBlockWarning}
                title="Block Student?"
                message={`Are you sure you want to block ${getStudentName()}? The student will be removed from All Student and Active Student and will only appear under Blocked.`}
                confirmText={
                    blocking ? "Blocking..." : "Confirm Block"
                }
                cancelText="Cancel"
                onCancel={handleCancelBlock}
                onConfirm={handleConfirmBlock}
            />

            <Warning
                open={showDeleteWarning}
                title="Delete Student?"
                message={`Are you sure you want to delete ${getStudentName()}? This action will remove the student from the student list.`}
                confirmText={
                    deleting ? "Deleting..." : "Confirm Delete"
                }
                cancelText="Cancel"
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}