import { useCallback, useEffect, useState } from "react";

import EmptyState from "../../../../../components/ui/EmptyState/EmptyState";
import Spinner from "../../../../../features/dashboard/common/LoaderPage/Spinner";

import { getNotices } from "../../../../../services/api/notice.service";
import { socket } from "../../../../../services/socket/socket";

import "./AllNotice.css";

export default function AllNotice({ refresh = 0, onSelectNotice }) {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotices = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getNotices();
            const sortedNotices = (response?.notices || [])
                .slice()
                .sort(
                    (first, second) =>
                        new Date(second.createdAt) - new Date(first.createdAt)
                );

            setNotices(sortedNotices);
        } catch (err) {
            console.error("Failed to load notices:", err);
            setError(
                err?.response?.data?.message ||
                "Unable to load notices."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(fetchNotices, 0);
        return () => clearTimeout(timer);
    }, [refresh, fetchNotices]);

    useEffect(() => {
        const handleNoticeChange = () => {
            queueMicrotask(() => {
                fetchNotices();
            });
        };

        socket.on("noticeCreated", handleNoticeChange);
        socket.on("noticeUpdated", handleNoticeChange);
        socket.on("noticeDeleted", handleNoticeChange);

        return () => {
            socket.off("noticeCreated", handleNoticeChange);
            socket.off("noticeUpdated", handleNoticeChange);
            socket.off("noticeDeleted", handleNoticeChange);
        };
    }, [fetchNotices]);

    if (loading) {
        return <Spinner message="Loading notices..." size={60} />;
    }

    if (error) {
        return (
            <div className="admin-notice-error">
                <h3>Unable to load notices</h3>
                <p>{error}</p>
                <button type="button" onClick={fetchNotices}>
                    Try Again
                </button>
            </div>
        );
    }

    if (notices.length === 0) {
        return (
            <EmptyState
                heading="No Notices"
                paragraph="Created notices will appear here."
            />
        );
    }

    return (
        <section className="admin-all-notice">
            <div className="admin-all-notice-header">
                <div>
                    <h2>All Notice</h2>
                    <p>
                        {notices.length} notice
                        {notices.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            <ul className="admin-notice-list">
                {notices.map((notice) => (
                    <li key={notice._id || notice.id}>
                        <button
                            type="button"
                            className="admin-notice-list-item"
                            onClick={() => onSelectNotice?.(notice)}
                        >
                            <span className="admin-notice-list-title">
                                {notice.shortTitle}
                            </span>
                            <span className="admin-notice-list-date">
                                {notice.createdAt
                                    ? new Date(notice.createdAt).toLocaleString("en-IN")
                                    : "—"}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}
