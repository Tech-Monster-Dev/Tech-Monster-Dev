import Skeleton from "../../../dashboard/common/LoaderPage/Skeleton";

export default function CertificateUserCardSkeleton() {
    return (
        <article className="certificate-user-card-skeleton">
            <div className="certificate-user-card-skeleton-main">
                <Skeleton
                    width="clamp(3rem, 8vw, 4.25rem)"
                    height="clamp(3rem, 8vw, 4.25rem)"
                    borderRadius="50%"
                />

                <div className="certificate-user-card-skeleton-info">
                    <Skeleton
                        width="100%"
                        height="clamp(0.9rem, 1.8vw, 1.05rem)"
                        borderRadius="0.4rem"
                        className="max-w-[72%]"
                    />
                    <Skeleton
                        width="100%"
                        height="clamp(0.7rem, 1.4vw, 0.85rem)"
                        borderRadius="0.35rem"
                        className="max-w-[92%]"
                    />
                    <Skeleton
                        width="100%"
                        height="clamp(0.65rem, 1.3vw, 0.8rem)"
                        borderRadius="0.35rem"
                        className="max-w-[78%]"
                    />
                </div>

                <Skeleton
                    width="clamp(4rem, 10vw, 5.5rem)"
                    height="clamp(1.7rem, 4vw, 2.25rem)"
                    borderRadius="999px"
                />
            </div>
        </article>
    );
}
