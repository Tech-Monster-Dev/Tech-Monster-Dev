import "./ApprovalTabs.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { socket } from "../../../../../services/socket/socket";
import { getAllSubmissions } from "../../../../../services/api/adminTask.service";

import SectionTabs from "../../../../../layouts/SectionTabs";
import ApprovalCard from "../ApprovalCard";
import EmptyState from "../../../../../components/ui/EmptyState";
import ApprovalSkeleton from "../ApprovalSkeleton";
import useSkeletonScrollLock from "../../../../../shared/hooks/useSkeletonScrollLock";


const MAIN_TABS = [
    { value: "pending", label: "Pending" },
    { value: "expired", label: "Expired" },
    { value: "approved", label: "Approved" },
];

const PROGRAM_TABS = [
    { value: "course", label: "Course" },
    { value: "internship", label: "Internship" },
];

const isInternshipSubmission = (submission) =>
    Boolean(submission?.internship);

const filterByProgram = (submissions, program) =>
    submissions.filter((submission) =>
        program === "internship"
            ? isInternshipSubmission(submission)
            : !isInternshipSubmission(submission)
    );

const APPROVAL_STATUS_STORAGE_KEY = "admin-task-approval-status";
const APPROVAL_PROGRAM_STORAGE_KEY = "admin-task-approval-program";

export default function ApprovalTabs({ onSelectSubmission }) {
    const [activeStatus, setActiveStatus] = useState(() => {
        const savedStatus = sessionStorage.getItem(APPROVAL_STATUS_STORAGE_KEY);
        return MAIN_TABS.some((tab) => tab.value === savedStatus)
            ? savedStatus
            : "pending";
    });

    const [activeProgram, setActiveProgram] = useState(() => {
        const savedProgram = sessionStorage.getItem(APPROVAL_PROGRAM_STORAGE_KEY);
        return PROGRAM_TABS.some((tab) => tab.value === savedProgram)
            ? savedProgram
            : "course";
    });
    const [submissions, setSubmissions] = useState({
        pending: [],
        expired: [],
        approved: [],
    });
    const [loading, setLoading] = useState(true);

    useSkeletonScrollLock(loading);

    const loadSubmissions = useCallback(async () => {
        try {
            setLoading(true);

            const [pendingResponse, expiredResponse, approvedResponse] =
                await Promise.all([
                    getAllSubmissions("pending"),
                    getAllSubmissions("expired"),
                    getAllSubmissions("approved"),
                ]);

            setSubmissions({
                pending: pendingResponse?.submissions || [],
                expired: expiredResponse?.submissions || [],
                approved: approvedResponse?.submissions || [],
            });
        } catch (error) {
            console.error("Failed to load task approvals:", error);
            setSubmissions({
                pending: [],
                expired: [],
                approved: [],
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            loadSubmissions();
        });
    }, [loadSubmissions]);

    useEffect(() => {
        const handleTaskSubmitted = () => {
            queueMicrotask(() => {
                loadSubmissions();
            });
        };

        socket.on("taskSubmitted", handleTaskSubmitted);

        return () => {
            socket.off("taskSubmitted", handleTaskSubmitted);
        };
    }, [loadSubmissions]);

    const activeSubmissions = useMemo(
        () => submissions[activeStatus] || [],
        [activeStatus, submissions]
    );

    const programSubmissions = useMemo(
        () => filterByProgram(activeSubmissions, activeProgram),
        [activeProgram, activeSubmissions]
    );

    const mainTabs = useMemo(
        () =>
            MAIN_TABS.map((tab) => ({
                ...tab,
                count: submissions[tab.value]?.length || 0,
            })),
        [submissions]
    );

    const programTabs = useMemo(
        () =>
            PROGRAM_TABS.map((tab) => ({
                ...tab,
                count: filterByProgram(activeSubmissions, tab.value).length,
            })),
        [activeSubmissions]
    );

    const handleStatusChange = (value) => {
        setActiveStatus(value);
        sessionStorage.setItem(APPROVAL_STATUS_STORAGE_KEY, value);
    };

    const handleProgramChange = (value) => {
        setActiveProgram(value);
        sessionStorage.setItem(APPROVAL_PROGRAM_STORAGE_KEY, value);
    };

    return (
        <section className="approval-tabs">
            <div className="approval-tabs-header">
                <div className="approval-tabs-heading">
                    <span>Task Review</span>
                    <h1>Submission Approval</h1>
                    <p>
                        Review student task submissions, check their validity,
                        and open the full submission details when required.
                    </p>
                </div>

                <div className="approval-tabs-summary">
                    <strong>{submissions[activeStatus]?.length || 0}</strong>
                    <span>
                        {activeStatus === "pending"
                            ? "awaiting review"
                            : `${activeStatus} submissions`}
                    </span>
                </div>
            </div>

            <SectionTabs
                tabs={mainTabs}
                activeTab={activeStatus}
                onChange={handleStatusChange}
                className="approval-main-tabs"
            />

            <div className="approval-tabs-nested">
                <SectionTabs
                    tabs={programTabs}
                    activeTab={activeProgram}
                    onChange={handleProgramChange}
                    className="approval-program-tabs"
                />
            </div>

            <div className="approval-tabs-content" aria-live="polite">
                {loading ? (
                    <ApprovalSkeleton />
                ) : programSubmissions.length === 0 ? (
                    <EmptyState
                        heading={`No ${activeStatus} ${activeProgram} submissions`}
                        paragraph={
                            activeStatus === "pending"
                                ? "There are no submissions waiting for approval in this category."
                                : `There are no ${activeStatus} submissions in this category right now.`
                        }
                    />
                ) : (
                    <div className="approval-tabs-grid">
                        {programSubmissions.map((submission, index) => (
                            <ApprovalCard
                                key={submission._id}
                                submission={submission}
                                index={index}
                                onClick={onSelectSubmission}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}