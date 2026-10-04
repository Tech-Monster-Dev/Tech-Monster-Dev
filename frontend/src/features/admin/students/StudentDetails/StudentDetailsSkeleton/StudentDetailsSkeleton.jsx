import "./StudentDetailsSkeleton.css";
import Skeleton from "../../../../dashboard/common/LoaderPage/Skeleton";

export default function StudentDetailsSkeleton() {
  return (
    <div className="studentDetailsSkeleton">
      <div className="studentDetailsSkeletonHero">
        <Skeleton width="100px" height="100px" borderRadius="50%" />
        <div className="studentDetailsSkeletonHeroInfo">
          <Skeleton width="220px" height="28px" />
          <Skeleton width="220px" height="15px" />
          <Skeleton width="180px" height="15px" />
          <Skeleton width="140px" height="15px" />
        </div>
      </div>

      <div className="studentDetailsSkeletonGrid">
        <SkeletonDetailCard title="Personal" titleWidth="120px" rows={6} />
        <SkeletonDetailCard title="Education" titleWidth="100px" rows={6} />
        <SkeletonDetailCard title="Address" titleWidth="100px" rows={5} />
        <SkeletonDetailCard title="Account" titleWidth="100px" rows={6} />
        <SkeletonDetailCard title="Professional & Social" titleWidth="160px" rows={4} />
      </div>

      <SkeletonTable titleWidth="100px" columns={9} />
      <SkeletonTable titleWidth="120px" columns={9} />
      <SkeletonTable titleWidth="120px" columns={5} />
      <SkeletonTable titleWidth="180px" columns={5} />
    </div>
  );
}

function SkeletonDetailCard({ titleWidth, rows = 5 }) {
  return (
    <div className="studentDetailsSkeletonCard">
      <Skeleton width={titleWidth} height="22px" />
      <div className="studentDetailsSkeletonCardContent">
        {Array.from({ length: rows }).map((_, i) => (<Skeleton key={i} width={i === rows - 1 ? "85%" : "100%"} height="15px" />))}
      </div>
    </div>
  );
}

function SkeletonTable({ titleWidth = "120px", columns = 3 }) {
  return (
    <div className="studentDetailsSkeletonTable">
      <div className="studentDetailsSkeletonTableHeader">
        <Skeleton width={titleWidth} height="22px" />
      </div>
      <div className="studentDetailsSkeletonRows">
        {Array.from({ length: 5 }).map((_, rix) =>
          <div
            className="studentDetailsSkeletonRow"
            key={rix}
            style={{ "--skeleton-columns": columns }}
          >
            {Array.from({ length: columns }).map((_, cix) => <Skeleton key={cix} width={cix === 0 ? "80%" : "60%"} height="15px" />)}
          </div>
        )}
      </div>
    </div>
  );
}
