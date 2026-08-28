import Skeleton from "../../../../dashboard/common/LoaderPage/Skeleton";

import {
    ATTENDANCE_BADGES,
    TIME_BADGES
} from "../../constants/badge.constants";

export default function BadgeLoading() {
    return (
        <section className="badges-page badges-skeleton-page">
            <header className="badges-page-header badges-skeleton-header">
                <div className="badges-skeleton-title">
                    <Skeleton width="120px" height="12px" />
                    <Skeleton
                        width="190px"
                        height="38px"
                        borderRadius="10px"
                    />
                    <Skeleton
                        width="390px"
                        height="15px"
                    />
                </div>

                <Skeleton
                    width="125px"
                    height="72px"
                    borderRadius="16px"
                />
            </header>

            <BadgeLoadingSection
                titleWidth="180px"
                badges={ATTENDANCE_BADGES}
            />

            <BadgeLoadingSection
                titleWidth="220px"
                badges={TIME_BADGES}
            />
        </section>
    );
}

function BadgeLoadingSection({
    titleWidth,
    badges
}) {
    return (
        <section className="badge-section">
            <div className="badges-skeleton-section-title">
                <Skeleton
                    width="43px"
                    height="43px"
                    borderRadius="12px"
                />

                <div>
                    <Skeleton
                        width={titleWidth}
                        height="22px"
                    />
                    <Skeleton
                        width="120px"
                        height="12px"
                    />
                </div>
            </div>

            <div className="badge-row">
                {badges.map(badge => (
                    <div
                        className="badge-skeleton-card"
                        key={badge.title}
                    >
                        <Skeleton
                            width="115px"
                            height="115px"
                            borderRadius="50%"
                        />
                        <Skeleton
                            width="145px"
                            height="20px"
                        />
                        <Skeleton
                            width="190px"
                            height="13px"
                        />
                        <Skeleton
                            width="165px"
                            height="13px"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
