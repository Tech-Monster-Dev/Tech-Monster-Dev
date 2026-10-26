import "./Notice.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";

import SectionHeader from "../../../components/ui/SectionHeader";
import PublicButton from "../../../components/ui/Button/PublicButton/PublicButton";
import EmptyState from "../../../components/ui/EmptyState";
import Spinner from "../../../features/dashboard/common/LoaderPage/Spinner";
import NoticeDetailed from "../../../features/admin/notices/components/NoticeDetailed";

import { getNotices } from "../../../services/api/notice.service";

const MAX_LANDING_NOTICES = 7;

function Notice() {
    const router = useRouter();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState(null);

    useEffect(() => {
        let mounted = true;

        const loadNotices = async () => {
            try {
                const response = await getNotices();

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

        loadNotices();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <>
            <section className="section" data-section="notice">
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
                                onClick={() => router.push("/notice")}
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