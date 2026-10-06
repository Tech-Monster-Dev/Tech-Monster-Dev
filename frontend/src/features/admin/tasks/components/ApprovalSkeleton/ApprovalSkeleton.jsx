import Skeleton from "../../../../dashboard/common/LoaderPage/Skeleton";
import "./ApprovalSkeleton.css";

export default function ApprovalSkeleton({ count = 6 }) {
    return (
        <div className="approval-skeleton-grid" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <div className="approval-skeleton-card" key={index}>
                    <Skeleton className="approval-skeleton-index" />

                    <div className="approval-skeleton-content">
                        <Skeleton className="approval-skeleton-avatar" />

                        <Skeleton className="approval-skeleton-name" />

                        <Skeleton className="approval-skeleton-status" />
                    </div>
                </div>
            ))}
        </div>
    );
}
