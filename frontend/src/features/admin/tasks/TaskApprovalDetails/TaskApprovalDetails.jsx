import "./TaskApprovalDetails.css";

import {
    useCallback,
    useEffect,
    useState
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import BackButton from "../../../../components/ui/Button/BackButton";
import DashButton from "../../../../components/ui/Button/DashButton";
import Form from "../../../../components/ui/Form";
import Spinner from "../../../../features/dashboard/common/LoaderPage/Spinner";

import { validateField } from "../../../../shared/utils/validation/formValidation";

import {
    getSubmissionDetails,
    getSubmissionByTaskId,
    getTaskDetails,
    approveTask,
    rejectTask,
    approveSubmission,
    rejectSubmission,
    extendSubmissionDeadline
} from "../../../../services/api/adminTask.service";

import CodeBlock from "../../../student/lessons/components/LessonContent/components/LessonPage/components/CodeBlock";

export default function TaskApprovalDetails() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState(null);
    const [isLegacyTask, setIsLegacyTask] = useState(false);
    const [comment, setComment] = useState("");
    const [errors, setErrors] = useState({});
    const [extending, setExtending] = useState(false);

    const validationRules = {
        comment: {
            required: true,
            requiredMessage: "Admin comment is required",
        },
    };

    const isApproved = task?.status?.toLowerCase() === "approved";

    const loadTask = useCallback(async () => {
        try {
            try {
                const res = await getSubmissionDetails(id);
                setTask(res.submission);
                setIsLegacyTask(false);
                return;
            } catch {
                const res = await getSubmissionByTaskId(id);
                setTask(res.submission);
                setIsLegacyTask(false);
                return;
            }
        } catch {
            try {
                const res = await getTaskDetails(id);
                setTask(res.task);
                setIsLegacyTask(true);
            } catch (err) {
                console.log(err);
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        queueMicrotask(() => {
            loadTask();
        });
    }, [loadTask]);

    const handleApprove = async () => {
        try {
            if (isLegacyTask) {
                await approveTask(id, comment);
            } else {
                await approveSubmission(id, comment);
            }
            toast.success("Task Approved");
            navigate("/admin/tasks", {
                replace: true
            });
        } catch (err) {
            console.error("APPROVE TASK ERROR:", err);
            console.error("APPROVE RESPONSE:", err.response?.data);
            toast.error(
                err.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    const handleReject = async () => {
        try {
            if (isLegacyTask) {
                await rejectTask(id, comment);
            } else {
                await rejectSubmission(id, comment);
            }
            toast.success("Task Rejected");
            navigate("/admin/tasks");
        }
        catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    const handleExtendDeadline = async () => {
        try {
            setExtending(true);
            const res = await extendSubmissionDeadline(id, 24);
            setTask(res.submission);
            toast.success("Deadline extended by 24 hours");
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Could not extend deadline"
            );
        } finally {
            setExtending(false);
        }
    };

    const handleCommentChange = (event) => {
        const { value } = event.target;
        setComment(value);
        setErrors((current) => ({
            ...current,
            comment: validateField("comment", value, validationRules),
        }));
    };

    const validateComment = () => {
        const commentError = validateField(
            "comment",
            comment,
            validationRules
        );

        setErrors({ comment: commentError });
        return !commentError;
    };

    const handleApproveWithValidation = async () => {
        if (!validateComment()) return;
        await handleApprove();
    };

    const handleRejectWithValidation = async () => {
        if (!validateComment()) return;
        await handleReject();
    };

    if (loading) {
        return (
            <div className="taskApprovalLoading">
                <Spinner
                    message="Loading task details..."
                    size={45}
                />
            </div>
        );
    }

    return (
        <motion.div
            className="taskApprovalDetails"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5 }}
        >
            <div className="taskApprovalDetailsHeader">
                <BackButton
                    to="/admin/tasks"
                    label="Back to Task Approval"
                    className="taskApprovalBackButton"
                />
            </div>

            <motion.div
                className="taskDetailsCard"
                initial={{ opacity: 0, scale: .95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: .2 }}
            >
                <h1>
                    Student Task Details
                </h1>

                <div className="detailRow">
                    <span>Student</span>
                    <p>
                        {task.student?.firstName || task.assignedTo?.firstName}{" "}
                        {task.student?.lastName || task.assignedTo?.lastName}
                    </p>
                </div>
                <div className="detailRow">
                    <span>Username</span>
                    <p>
                        {task.student?.username || task.assignedTo?.username}
                    </p>
                </div>
                <div className="detailRow">
                    <span>Email</span>
                    <p>
                        {task.student?.email || task.assignedTo?.email}
                    </p>
                </div>
                <div className="detailRow">
                    <span>Internship</span>
                    <p>
                        {task.internship?.title || task.courseSlug || "—"}
                    </p>
                </div>
                <div className="detailRow">
                    <span>Module</span>
                    <p>
                        {task.moduleTitle || task.moduleId || "—"}
                    </p>
                </div>
                <div className="detailRow">
                    <span>Task</span>
                    <p>
                        {task.taskTitle || task.title || "—"}
                    </p>
                </div>
                <div className="detailRow">
                    <span>Description</span>
                    <p>
                        {task.problemStatement || task.description || "—"}
                    </p>
                </div>
                <div className="detailRow">
                    <span>Status</span>
                    <p>
                        {task.status || "pending"}
                    </p>
                </div>
                <div className="detailRow">
                    <span>Unlocked At</span>
                    <p>
                        {task.unlockedAt ? new Date(task.unlockedAt).toLocaleString() : "-"}
                    </p>
                </div>
                <div className="detailRow">
                    <span>Expires At</span>
                    <p>
                        {task.expiresAt ? new Date(task.expiresAt).toLocaleString() : "-"}
                    </p>
                </div>
                <div className="detailRow">
                    <span>Github</span>
                    <a
                        href={task.githubLink}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {task.githubLink || "-"}
                    </a>
                </div>
                <div className="detailRow">
                    <span>Code</span>
                    {task.code ? (
                        <CodeBlock
                            code={task.code}
                            language={
                                task.language ||
                                task.programmingLanguage ||
                                "text"
                            }
                        />
                    ) : (
                        <pre>-</pre>
                    )}
                </div>

                {isApproved ? (
                    <div className="taskApprovalStatusBadge" role="status">
                        Approved
                    </div>
                ) : (
                <Form
                    fields={[
                        {
                            name: "comment",
                            type: "textarea",
                            label: "Admin Comment",
                            placeholder: "Admin Comment...",
                            rows: 5,
                            required: true,
                            value: comment,
                            error: errors.comment,
                            className: "taskapprovalDetails-textarea",
                        },
                    ]}
                    values={{ comment }}
                    errors={errors}
                    onChange={handleCommentChange}
                    formClassName="taskApprovalForm"
                    buttonComponent={DashButton}
                    actions={[
                        {
                            label: "Approve",
                            type: "button",
                            variant: "success",
                            size: "medium",
                            className: "approveBtn",
                            onClick: handleApproveWithValidation,
                        },
                        ...(!isLegacyTask
                            ? [
                                {
                                    label: "Incorrect",
                                    type: "button",
                                    variant: "danger",
                                    size: "medium",
                                    className: "rejectBtn",
                                    onClick: handleRejectWithValidation,
                                },
                            ]
                            : []),
                        {
                            label: extending ? "Extending..." : "Extend Deadline",
                            type: "button",
                            variant: "primary",
                            size: "medium",
                            loading: extending,
                            loadingText: "Extending...",
                            className: "extendBtn",
                            onClick: handleExtendDeadline,
                        },
                    ]}
                />
                )}
            </motion.div>
        </motion.div>
    );
}