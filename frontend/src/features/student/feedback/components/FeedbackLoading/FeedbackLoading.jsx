import Skeleton from "../../../../dashboard/common/LoaderPage/Skeleton/Skeleton";

export default function FeedbackLoading() {
    return (
        <section className="feedback-page feedback-skeleton-page">
            <div className="feedback-skeleton-header">
                <Skeleton width="150px" height="12px" />
                <Skeleton width="280px" height="34px" />
                <Skeleton width="520px" height="14px" />
            </div>

            <Skeleton
                width="100%"
                height="48px"
                borderRadius="10px"
            />

            <div className="feedback-skeleton-form">
                <Skeleton width="180px" height="18px" />
                <Skeleton width="100%" height="46px" borderRadius="8px" />
                <Skeleton width="180px" height="18px" />
                <Skeleton width="100%" height="130px" borderRadius="8px" />
                <Skeleton width="150px" height="18px" />
                <Skeleton width="180px" height="42px" borderRadius="8px" />
            </div>

            <div className="feedback-skeleton-cards">
                {[1, 2, 3].map((item) => (
                    <div className="feedback-skeleton-card" key={item}>
                        <Skeleton width="110px" height="16px" />
                        <Skeleton width="100%" height="18px" />
                        <Skeleton width="92%" height="14px" />
                        <Skeleton width="75%" height="14px" />
                    </div>
                ))}
            </div>
        </section>
    );
}
