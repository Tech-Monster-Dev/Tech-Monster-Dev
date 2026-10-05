import "./AdminCoursesInternshipsSkeleton.css";

import Skeleton from "../../../../dashboard/common/LoaderPage/Skeleton";

const AdminCoursesInternshipsSkeleton = () => {
    return (
        <section className="adminLearningSkeleton">
            <header className="adminLearningSkeletonHeader">
                <div className="adminLearningSkeletonIntro">
                    <Skeleton width="clamp(7rem,18vw,10rem)" height="clamp(0.65rem,1.5vw,0.75rem)" borderRadius="0.25rem" />
                    <Skeleton width="clamp(15rem,42vw,23rem)" height="clamp(1.75rem,4vw,2.4rem)" borderRadius="0.45rem" />
                    <Skeleton width="min(100%,38rem)" height="clamp(0.75rem,1.8vw,0.9rem)" borderRadius="0.35rem" />
                    <Skeleton width="min(88%,31rem)" height="clamp(0.75rem,1.8vw,0.9rem)" borderRadius="0.35rem" />
                </div>

                <div className="adminLearningSkeletonActions">
                    <Skeleton width="clamp(9rem,18vw,11rem)" height="clamp(2.5rem,7vw,2.875rem)" borderRadius="clamp(0.55rem,1.5vw,0.75rem)" />
                    <Skeleton width="clamp(9rem,18vw,11rem)" height="clamp(2.5rem,7vw,2.875rem)" borderRadius="clamp(0.55rem,1.5vw,0.75rem)" />
                </div>
            </header>

            <nav className="adminLearningSkeletonTabs" aria-hidden="true">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div className="adminLearningSkeletonTab" key={index}>
                        <Skeleton width="clamp(5.5rem,12vw,7.5rem)" height="clamp(0.75rem,1.8vw,0.9rem)" borderRadius="0.3rem" />
                        <Skeleton width="clamp(1.25rem,3vw,1.5rem)" height="clamp(1.25rem,3vw,1.5rem)" borderRadius="999px" />
                    </div>
                ))}
            </nav>

            <div className="adminLearningSkeletonGrid">
                {Array.from({ length: 6 }).map((_, index) => (
                    <article className="adminLearningSkeletonCard" key={index}>
                        <div className="adminLearningSkeletonCardTop">
                            <Skeleton width="clamp(4rem,11vw,6rem)" height="clamp(1.25rem,3vw,1.5rem)" borderRadius="999px" />
                        </div>

                        <div className="adminLearningSkeletonCardContent">
                            <Skeleton width="min(88%,15rem)" height="clamp(1rem,2.5vw,1.25rem)" borderRadius="0.35rem" />
                            <Skeleton width="min(70%,11rem)" height="clamp(0.7rem,1.7vw,0.85rem)" borderRadius="0.3rem" />
                        </div>

                        <div className="adminLearningSkeletonCardFooter">
                            <Skeleton width="clamp(5rem,12vw,7rem)" height="clamp(0.65rem,1.5vw,0.75rem)" borderRadius="0.3rem" />
                            <Skeleton width="clamp(1.75rem,4vw,2rem)" height="clamp(1.75rem,4vw,2rem)" borderRadius="999px" />
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default AdminCoursesInternshipsSkeleton;
