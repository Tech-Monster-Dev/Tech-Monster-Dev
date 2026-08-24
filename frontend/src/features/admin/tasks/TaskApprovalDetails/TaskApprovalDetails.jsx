import {
    useCallback,
    useEffect,
    useState
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
    getSubmissionDetails,
    approveSubmission,
    rejectSubmission,
    extendSubmissionDeadline
} from "../../../../services/api/adminTask.service";

import "./TaskApprovalDetails.css";

export default function TaskApprovalDetails() {
    const navigate = useNavigate();

    const { id } = useParams();

    const [loading, setLoading] = useState(true);

    const [task, setTask] = useState(null);

    const [comment, setComment] = useState("");
    const [extending, setExtending] = useState(false);

    const loadTask = useCallback(async () => {

        try {

            const res = await getSubmissionDetails(id);

            setTask(res.submission);

        } catch (err) {

            console.log(err);

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

            await approveSubmission(id, comment);

            toast.success("Task Approved");

            navigate("/admin/tasks", {
                replace: true
            });

        }

        catch (err) {

            toast.error(

                err.response?.data?.message ||

                "Something went wrong"

            );

        }

    };

    const handleReject = async () => {

        try {

            await rejectSubmission(id, comment);

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

    if (loading) {

        return <h2>Loading...</h2>;

    }

    return (

        <motion.div

            className="taskApprovalDetails"

            initial={{ opacity: 0, y: 40 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: .5 }}

        >

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
                    <span>Expired At</span>
                    <p>
                        {task.expiredAt ? new Date(task.expiredAt).toLocaleString() : "-"}
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
                    <span>Live</span>
                    <a
                        href={task.liveLink}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {task.liveLink || "-"}
                    </a>
                </div>
                <div className="detailRow">
                    <span>Answer</span>
                    <pre>
                        {task.answer || "-"}
                    </pre>
                </div>
                <div className="detailRow">
                    <span>Code</span>
                    <pre>
                        {task.code || "-"}
                    </pre>
                </div>

                <textarea

                    placeholder="Admin Comment..."

                    value={comment}

                    onChange={(e) =>

                        setComment(e.target.value)

                    }

                />

                <div className="approvalButtons">

                    <motion.button

                        whileHover={{

                            scale: 1.05

                        }}

                        whileTap={{

                            scale: .95

                        }}

                        className="approveBtn"

                        onClick={handleApprove}

                    >

                        Approve

                    </motion.button>

                    <motion.button

                        whileHover={{

                            scale: 1.05

                        }}

                        whileTap={{

                            scale: .95

                        }}

                        className="rejectBtn"

                        onClick={handleReject}

                    >

                        Incorrect

                    </motion.button>

                    <motion.button

                        whileHover={{

                            scale: 1.05

                        }}

                        whileTap={{

                            scale: .95

                        }}

                        className="extendBtn"

                        onClick={handleExtendDeadline}

                        disabled={extending}

                    >

                        {extending ? "Extending..." : "Extend Deadline"}

                    </motion.button>

                </div>

            </motion.div>

        </motion.div>

    );

}
