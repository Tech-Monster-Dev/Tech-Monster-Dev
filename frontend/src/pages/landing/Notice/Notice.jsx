import "./Notice.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

import SectionHeader from "../../../components/ui/SectionHeader";
import PublicButton from "../../../components/ui/Button/PublicButton/PublicButton";
import EmptyState from "../../../components/ui/EmptyState";
import Spinner from "../../../features/dashboard/common/LoaderPage/Spinner";
import NoticeDetailed from "../../../features/admin/notices/components/NoticeDetailed";

import { getNotices } from "../../../services/api/notice.service";
import { socket } from "../../../services/socket/socket";

const MAX_LANDING_NOTICES = 7;

function Notice() {
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState(null);

    useEffect(() => {
        let mounted = true;

        const loadNotices = async () => {
            try {
                const response = await getNotices();
                console.log("NOTICES:", response);

                if (mounted) {
                    setNotices(
                        (response?.notices || [])
                            .slice()
                            .sort(
                                (first, second) =>
                                    new Date(second.createdAt) -
                                    new Date(first.createdAt)
                            )
                            .slice(0, MAX_LANDING_NOTICES)
                    );
                }
            } catch (error) {
                console.error("Failed to load notices:", error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        const handleNoticeCreated = (payload) => {
            const notice = payload?.notice;

            if (!notice) {
                return;
            }

            setNotices((current) => {
                if (current.some((item) => item._id === notice._id)) {
                    return current;
                }

                return [notice, ...current].slice(0, MAX_LANDING_NOTICES);
            });
        };

        const handleNoticeUpdated = (payload) => {
            const notice = payload?.notice;

            if (!notice) {
                return;
            }

            setNotices((current) =>
                current
                    .map((item) =>
                        item._id === notice._id ? notice : item
                    )
                    .sort(
                        (first, second) =>
                            new Date(second.createdAt) -
                            new Date(first.createdAt)
                    )
                    .slice(0, MAX_LANDING_NOTICES)
            );
        };

        const handleNoticeDeleted = (payload) => {
            const noticeId = payload?.noticeId;

            if (!noticeId) {
                return;
            }

            setNotices((current) =>
                current.filter((item) => item._id !== noticeId)
            );
        };

        loadNotices();

        socket.on("noticeCreated", handleNoticeCreated);
        socket.on("noticeUpdated", handleNoticeUpdated);
        socket.on("noticeDeleted", handleNoticeDeleted);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            mounted = false;
            socket.off("noticeCreated", handleNoticeCreated);
            socket.off("noticeUpdated", handleNoticeUpdated);
            socket.off("noticeDeleted", handleNoticeDeleted);
        };
    }, []);

    return (
        <>
            <section className="section">
                <div className="landing-notice-page">
                    <SectionHeader
                        badge="NOTICE"
                        description="Stay updated with the latest announcements from Tech Monster."
                    />

                    <div className="landing-notice-content">
                        {loading && (
                            <Spinner
                                message="Loading notices..."
                                size={60}
                            />
                        )}

                        {!loading && notices.length === 0 && (
                            <EmptyState
                                paragraph="No notices available yet."
                            />
                        )}

                        {!loading && notices.length > 0 && (
                            <ul className="landing-notice-list">
                                {notices.map((notice) => (
                                    <li key={notice._id} className="landing-notice-list-item">
                                        <button
                                            type="button"
                                            className="landing-notice-item"
                                            onClick={() => setSelectedNotice(notice)}
                                        >
                                            <span className="landing-notice-arrow">
                                                <FiArrowRight />
                                            </span>

                                            <span className="landing-notice-title">
                                                {notice.shortTitle}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="landing-notice-cta">
                            <PublicButton
                                variant="outline"
                                background={false}
                                size="medium"
                                icon={<FiArrowRight />}
                                iconPosition="right"
                                onClick={() => navigate("/notice")}
                            >
                                All Notice
                            </PublicButton>
                        </div>
                    </div>
                </div>

            </section>
            
            <NoticeDetailed
                open={Boolean(selectedNotice)}
                notice={selectedNotice}
                onClose={() => setSelectedNotice(null)}
            />
        </>
    );
}

export default Notice;