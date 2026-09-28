import Skeleton from '../../../dashboard/common/LoaderPage/Skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="student-profile-container">
      {/* Header Skeleton */}
      <div className="student-profile-card skeleton-wrapper">
        <div className="student-profile-skeleton-row">
          <Skeleton
            width="clamp(4.5rem, 15vw, 6.875rem)"
            height="clamp(4.5rem, 15vw, 6.875rem)"
            borderRadius="50%"
          />

          <div className="student-profile-skeleton-column">
            <Skeleton width="min(100%, 13.75rem)" height="clamp(1.5rem, 4vw, 1.75rem)" />
            <Skeleton width="min(100%, 8.75rem)" height="clamp(1rem, 2.5vw, 1.125rem)" />
            <Skeleton width="min(100%, 11.25rem)" height="clamp(0.875rem, 2.25vw, 1rem)" />

            <div className="student-profile-skeleton-stats">
              <Skeleton width="clamp(4.5rem, 12vw, 5rem)" height="clamp(1.25rem, 3vw, 1.375rem)" />
              <Skeleton width="clamp(4.5rem, 12vw, 5rem)" height="clamp(1.25rem, 3vw, 1.375rem)" />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons Skeleton */}
      <div className="student-profile-actions">
        <Skeleton
          width="clamp(7rem, 30vw, 8.125rem)"
          height="clamp(2.5rem, 8vw, 2.625rem)"
          borderRadius="clamp(0.5rem, 2vw, 0.625rem)"
        />
        <Skeleton
          width="clamp(7rem, 30vw, 8.125rem)"
          height="clamp(2.5rem, 8vw, 2.625rem)"
          borderRadius="clamp(0.5rem, 2vw, 0.625rem)"
        />
      </div>

      {/* Grid Skeleton */}
      <div className="student-profile-cards-grid">
        {[1, 2, 3].map((item) => (
          <div key={item} className="student-profile-card">
            <Skeleton
              width="60%"
              height="clamp(1.25rem, 3vw, 1.375rem)"
            />

            <div className="mt-[clamp(0.75rem,3vw,1rem)] flex flex-col gap-[clamp(0.5rem,2vw,0.625rem)]">
              <Skeleton
                width="100%"
                height="clamp(2.5rem, 8vw, 2.8125rem)"
                borderRadius="clamp(0.5rem, 2vw, 0.625rem)"
              />
              <Skeleton
                width="100%"
                height="clamp(2.5rem, 8vw, 2.8125rem)"
                borderRadius="clamp(0.5rem, 2vw, 0.625rem)"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
