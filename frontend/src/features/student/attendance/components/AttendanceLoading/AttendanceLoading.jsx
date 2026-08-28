import "./AttendanceLoading.css";
import Skeleton from "../../../../dashboard/common/LoaderPage/Skeleton";

export default function AttendanceLoading() {
  return (
    <div className="attendance-page attendance-skeleton-page">
      <div className="attendance-skeleton-header">
        <div>
          <Skeleton width="180px" height="14px" />
          <Skeleton width="280px" height="34px" />
          <Skeleton width="360px" height="16px" />
        </div>

        <div className="attendance-skeleton-stats">
          <Skeleton
            width="110px"
            height="82px"
            borderRadius="16px"
          />

          <Skeleton
            width="110px"
            height="82px"
            borderRadius="16px"
          />
        </div>
      </div>

      <Skeleton
        width="100%"
        height="420px"
        borderRadius="16px"
      />
    </div>
  );
}
