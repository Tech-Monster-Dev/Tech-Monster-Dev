import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiClock, FiAlertTriangle } from "react-icons/fi";
import Link from "next/link";

import "./TaskStatusNotice.css";

const HOURS = 48;
const MS = 1000 * 60 * 60 * HOURS;

// Safely parse the submittedAt timestamp into ms. Returns 0 when invalid.
const parseTime = (submittedAt) => {
    const date = new Date(submittedAt);
    return isNaN(date.getTime()) ? 0 : date.getTime();
};

// Compute whether a submission is older than 48 hours using a fresh "now"
// timestamp passed in. Kept pure so it is safe to call anywhere.
const isDelayed = (submittedAt, now) =>
    parseTime(submittedAt) > 0 && now - parseTime(submittedAt) > MS;

export default function TaskStatusNotice({ submittedAt, status }) {
    // Derive the initial "delayed" flag from props (pure, no Date.now here).
    const [delayed, setDelayed] = useState(() =>
        isDelayed(submittedAt, Date.now())
    );

    // Refresh the delay flag every 30s via a timer callback. The setState
    // calls happen inside a subscription callback (the interval tick), which
    // is the pattern React's rules recommend, so renders stay pure.
    useEffect(() => {
        const id = setInterval(() => {
            setDelayed(isDelayed(submittedAt, Date.now()));
        }, 30 * 1000);
        return () => clearInterval(id);
    }, [submittedAt]);

    if (!status || status === "approved") return null;

    const isPending = status === "pending" || status === "submitted";
    if (!isPending) return null;

    return (
        <motion.div
            className="task-status-notice"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="task-status-notice-icon">
                <FiClock />
            </div>
            <div className="task-status-notice-body">
                <h4>Pending Admin Approval</h4>
                <p>
                    Your task answer has been submitted and is currently pending
                    Admin approval. Approval usually takes up to 2 days.
                </p>

                {delayed && (
                    <div className="task-support-delay">
                        <FiAlertTriangle />
                        <span>
                            Taking longer than usual?{" "}
                            <Link href="/student/help&support">
                                Contact Our Support Team
                            </Link>
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
