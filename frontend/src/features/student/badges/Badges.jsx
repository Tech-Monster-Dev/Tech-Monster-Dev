import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import BadgeSectionHeader from "./components/BadgeSectionHeader";
import useBadgesData from "./hooks/useBadgesData";
import BadgeList from "./components/BadgeList";
import BadgeLoading from "./components/BadgeLoading";
import EarnedBadgesModal from "./components/EarnedBadgesModal";
import {
    ATTENDANCE_BADGES,
    TIME_BADGES
} from "./constants/badge.constants";
import "./Badges.css";

export default function Badges() {
    const [showEarned, setShowEarned] = useState(false);

    const { badges, loading } = useBadgesData();

    const attendanceBadges = useMemo(
        () =>
            badges.filter(
                badge =>
                    badge.category === "ATTENDANCE"
            ),
        [badges]
    );

    const findBadge = title =>
        attendanceBadges.find(
            badge =>
                badge.title === title
        );

    const earnedCount =
        attendanceBadges.length;

    if (loading) {
        return <BadgeLoading />;
    }

    return (
        <section className="badges-page">

            <header className="badges-page-header">

                <div>
                    <span className="badges-eyebrow">
                        ACHIEVEMENTS
                    </span>

                    <h1>
                        Badges
                    </h1>

                    <p>
                        Complete challenges and unlock
                        achievements throughout your
                        Tech Monster journey.
                    </p>
                </div>

                <button type="button" className="earned-counter" onClick={() => setShowEarned(true)} aria-label="View earned badges">
                    <FaTrophy />

                    <div>
                        <strong>
                            {earnedCount}
                        </strong>

                        <span>
                            Earned
                        </span>
                    </div>
                </button>

            </header>

            {showEarned && (
                <EarnedBadgesModal
                    badges={attendanceBadges}
                    onClose={() => setShowEarned(false)}
                />
            )}

                <BadgeSectionHeader
                    icon="🏅"
                    title="Attendance Badges"
                    count={ATTENDANCE_BADGES.length}
                />

            <section className="badge-section attendance-badge-section">

                <BadgeList
                    definitions={ATTENDANCE_BADGES}
                    findBadge={findBadge}
                />

            </section>

                <BadgeSectionHeader
                    icon="⏱️"
                    title="Daily Active Time Badges"
                    count={TIME_BADGES.length}
                />

            <section className="badge-section time-badge-section">

                <BadgeList
                    definitions={TIME_BADGES}
                    findBadge={findBadge}
                />

            </section>

        </section>
    );
}
