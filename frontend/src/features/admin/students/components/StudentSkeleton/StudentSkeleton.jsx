import "./StudentSkeleton.css";

import Skeleton from "../../../../dashboard/common/LoaderPage/Skeleton";

export default function StudentSkeleton() {
    return (
        <div className="studentSkeletonCard">
            {/* Top section */}
            <div className="studentSkeletonTop">
                <Skeleton
                    width="85px"
                    height="85px"
                    borderRadius="50%"
                />

                <div className="studentSkeletonInfo">
                    <Skeleton
                        width="150px"
                        height="18px"
                    />

                    <Skeleton
                        width="190px"
                        height="13px"
                    />

                    <Skeleton
                        width="100px"
                        height="12px"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="studentSkeletonStats">
                <div>
                    <Skeleton
                        width="45px"
                        height="18px"
                    />

                    <Skeleton
                        width="55px"
                        height="11px"
                    />
                </div>

                <div>
                    <Skeleton
                        width="45px"
                        height="18px"
                    />

                    <Skeleton
                        width="70px"
                        height="11px"
                    />
                </div>

                <div>
                    <Skeleton
                        width="55px"
                        height="18px"
                    />

                    <Skeleton
                        width="50px"
                        height="11px"
                    />
                </div>
            </div>

            {/* Action buttons */}
            <div className="studentSkeletonActions">
                {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton
                        key={item}
                        width="40px"
                        height="40px"
                        borderRadius="10px"
                    />
                ))}
            </div>
        </div>
    );
}