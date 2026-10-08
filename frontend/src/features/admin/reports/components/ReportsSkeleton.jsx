import Skeleton from "../../../dashboard/common/LoaderPage/Skeleton";

const ReportsSkeleton = ({
    chart = true,
    users = true,
    userCount = 6,
}) => {
    return (
        <div className="reports-skeleton" aria-hidden="true">
            {chart && (
                <section className="reports-skeleton-chart">
                    <Skeleton className="reports-skeleton-heading" />
                    <Skeleton className="reports-skeleton-chart-body" />
                </section>
            )}

            {users && (
                <section className="reports-skeleton-users">
                    <Skeleton className="reports-skeleton-users-heading" />

                    <div className="reports-skeleton-user-grid">
                        {Array.from(
                            { length: userCount },
                            (_, index) => (
                                <div
                                    className="reports-skeleton-user-card"
                                    key={index}
                                >
                                    <Skeleton className="reports-skeleton-avatar" />

                                    <div className="reports-skeleton-user-content">
                                        <Skeleton className="reports-skeleton-name" />
                                        <Skeleton className="reports-skeleton-meta" />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ReportsSkeleton;