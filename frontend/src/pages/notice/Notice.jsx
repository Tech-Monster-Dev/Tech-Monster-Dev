import "./Notice.css";

import { useCallback, useEffect, useState } from "react";
import BackButton from "../../components/ui/Button/BackButton";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../features/dashboard/common/LoaderPage/Spinner";
import NoticeDetailed from "../../features/admin/notices/components/NoticeDetailed";
import { getNotices } from "../../services/api/notice.service";
import { socket } from "../../services/socket/socket";


export default function Notice() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedNotice, setSelectedNotice] = useState(null);

    const handleNoticeSelect = (notice) => {
        setSelectedNotice(notice);
    };

    const fetchNotices = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getNotices();

            const sortedNotices = (response?.notices || [])
                .slice()
                .sort(
                    (first, second) =>
                        new Date(second.createdAt) -
                        new Date(first.createdAt)
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
    }, [fetchNotices]);

    useEffect(() => {
        const handleNoticeChange = () => {
            queueMicrotask(() => {
                fetchNotices();
            });
        };

        socket.on("noticeCreated", handleNoticeChange);
        socket.on("noticeUpdated", handleNoticeChange);
        socket.on("noticeDeleted", handleNoticeChange);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off("noticeCreated", handleNoticeChange);
            socket.off("noticeUpdated", handleNoticeChange);
            socket.off("noticeDeleted", handleNoticeChange);
        };
    }, [fetchNotices]);

    return (
        <main className="public-notice-page">
            <BackButton
                to="/"
                label="Back to Landing Page"
                className="public-notice-back-button"
            />

            <header className="public-notice-header">
                <p className="public-notice-eyebrow">NOTICE</p>
                <h1>All Notices</h1>
                <p>
                    Stay updated with the latest announcements from Tech
                    Monster.
                </p>
            </header>

            {loading && (
                <Spinner
                    message="Loading notices..."
                    size={60}
                />
            )}

            {!loading && error && (
                <div className="public-notice-error">
                    <h2>Unable to load notices</h2>
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={fetchNotices}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!loading && !error && notices.length === 0 && (
                <EmptyState
                    heading="No Notices"
                    paragraph="No notices are available yet."
                />
            )}

            {!loading && !error && notices.length > 0 && (
                <ul className="public-notice-list">
                    {notices.map((notice) => (
                        <li key={notice._id || notice.id}>
                            <button
                                type="button"
                                className="public-notice-list-item"
                                onClick={() => handleNoticeSelect(notice)}
                            >
                                <span>{notice.shortTitle}</span>
                                <time
                                    dateTime={
                                        notice.createdAt || undefined
                                    }
                                >
                                    {notice.createdAt
                                        ? new Date(
                                            notice.createdAt
                                        ).toLocaleString("en-IN")
                                        : "—"}
                                </time>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <NoticeDetailed
                open={Boolean(selectedNotice)}
                notice={selectedNotice}
                onClose={() => setSelectedNotice(null)}
            />
        </main>
    );
}
