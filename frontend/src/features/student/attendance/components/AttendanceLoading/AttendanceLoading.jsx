import "./AttendanceLoading.css";
import Skeleton from "../../../../dashboard/common/LoaderPage/Skeleton";

export default function AttendanceLoading() {
  return (
    <div className="attendance-page attendance-skeleton-page">

      <div className="attendance-skeleton-header">
        <div className="attendance-skeleton-heading">
          <Skeleton className="attendance-skeleton-breadcrumb" />
          <Skeleton className="attendance-skeleton-title" />
          <Skeleton className="attendance-skeleton-description" />
        </div>

        <div className="attendance-skeleton-stats">
          <Skeleton
            className="attendance-skeleton-stat"
            borderRadius="16px"
          />

          <Skeleton
            className="attendance-skeleton-stat"
            borderRadius="16px"
          />
        </div>
      </div>

      <Skeleton
        className="attendance-skeleton-calendar"
        borderRadius="16px"
      />

    </div>
  );
}