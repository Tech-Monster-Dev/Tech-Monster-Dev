import "./TaskApproval.css";

import { useEffect, useState } from "react";
import { getSubmissionDetails } from "../../../services/api/adminTask.service";

import ApprovalTabs from "./components/ApprovalTabs";
import ApprovalPreviewModal from "./components/ApprovalPreviewModal";

const APPROVAL_MODAL_STORAGE_KEY = "admin-task-approval-modal";

export default function TaskApproval() {
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        const savedSubmissionId = sessionStorage.getItem(
            APPROVAL_MODAL_STORAGE_KEY
        );

        if (!savedSubmissionId) {
            return;
        }

        let cancelled = false;

        const restoreSubmission = async () => {
            try {
                const response = await getSubmissionDetails(savedSubmissionId);

                if (!cancelled) {
                    setSelectedSubmission(response?.submission || null);
                }
            } catch (error) {
                console.error("Failed to restore task approval modal:", error);
                sessionStorage.removeItem(APPROVAL_MODAL_STORAGE_KEY);
            }
        };

        restoreSubmission();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleSelectSubmission = (submission) => {
        if (!submission?._id) {
            return;
        }

        sessionStorage.setItem(
            APPROVAL_MODAL_STORAGE_KEY,
            submission._id
        );
        setSelectedSubmission(submission);
    };

    const handleCloseModal = () => {
        sessionStorage.removeItem(APPROVAL_MODAL_STORAGE_KEY);
        setSelectedSubmission(null);
    };

    return (
        <main className="task-approval-page">
            <ApprovalTabs
                onSelectSubmission={handleSelectSubmission}
            />

            <ApprovalPreviewModal
                submission={selectedSubmission}
                onClose={handleCloseModal}
            />
        </main>
    );
}