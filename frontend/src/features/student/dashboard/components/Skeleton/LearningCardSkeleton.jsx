import "./LearningCardSkeleton.css";
import Skeleton from "../../../../dashboard/common/LoaderPage/Skeleton";

const LearningCardSkeleton = ({ showProgress = false }) => {
    return (
        <div className="learning-card-skeleton">
            <Skeleton
                width="58px"
                height="24px"
                borderRadius="999px"
            />

            <div className="learning-card-skeleton-content">
                <Skeleton
                    width="72%"
                    height="18px"
                    borderRadius="6px"
                />

                <Skeleton
                    width="48%"
                    height="12px"
                    borderRadius="5px"
                />

                {showProgress && (
                    <div className="learning-card-skeleton-progress">
                        <div className="learning-card-skeleton-progress-header">
                            <Skeleton
                                width="55px"
                                height="10px"
                                borderRadius="4px"
                            />

                            <Skeleton
                                width="28px"
                                height="10px"
                                borderRadius="4px"
                            />
                        </div>

                        <Skeleton
                            width="100%"
                            height="5px"
                            borderRadius="999px"
                        />
                    </div>
                )}
            </div>

            <Skeleton
                width="32px"
                height="32px"
                borderRadius="50%"
            />
        </div>
    );
};

export default LearningCardSkeleton;

