import Skeleton from "../../../../dashboard/common/LoaderPage/Skeleton/Skeleton";

export default function FeedbackLoading() {
    return (
        <section className="feedback-page feedback-skeleton-page">
            <div className="feedback-skeleton-header">
                <Skeleton width="clamp(7rem,25vw,9.375rem)" height="clamp(0.65rem,1.5vw,0.75rem)" />
                <Skeleton width="clamp(12rem,45vw,17.5rem)" height="clamp(1.75rem,5vw,2.125rem)" />
                <Skeleton width="min(100%,32.5rem)" height="clamp(0.75rem,1.8vw,0.875rem)" />
            </div>

            <Skeleton
                width="100%"
                height="48px"
                borderRadius="10px"
            />

            <div className="feedback-skeleton-form">
                <Skeleton width="clamp(9rem,30vw,11.25rem)" height="clamp(0.9rem,2vw,1.125rem)" />
                <Skeleton width="100%" height="46px" borderRadius="8px" />
                <Skeleton width="clamp(9rem,30vw,11.25rem)" height="clamp(0.9rem,2vw,1.125rem)" />
                <Skeleton width="100%" height="130px" borderRadius="8px" />
                <Skeleton width="clamp(7.5rem,25vw,9.375rem)" height="clamp(0.9rem,2vw,1.125rem)" />
                <Skeleton width="clamp(9rem,35vw,11.25rem)" height="clamp(2rem,5vw,2.625rem)" borderRadius="8px" />
            </div>

            <div className="feedback-skeleton-cards">
                {[1, 2, 3].map((item) => (
                    <div className="feedback-skeleton-card" key={item}>
                        <Skeleton width="clamp(5.5rem,20vw,6.875rem)" height="clamp(0.8rem,1.8vw,1rem)" />
                        <Skeleton width="100%" height="18px" />
                        <Skeleton width="92%" height="14px" />
                        <Skeleton width="75%" height="14px" />
                    </div>
                ))}
            </div>
        </section>
    );
}
