import ActivityLogList from "./ActivityLogList";

import BackButton from "../../../../components/ui/Button/BackButton";
import Spinner from "../../../dashboard/common/LoaderPage/Spinner";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
    getActivityUsers,
    getUserActivity,
} from "../../../../services/api/reports.service";

const getFullName = (user) =>
    [user?.firstName, user?.middleName, user?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || user?.username || "Unknown user";

const getInitialMonth = () => {
    const now = new Date();

    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
    };
};

const ActivityDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const initialDate = useMemo(() => {
        const current = getInitialMonth();

        const year = Number(searchParams.get("year"));
        const month = Number(searchParams.get("month"));

        return {
            year:
                Number.isInteger(year) && year >= 2000 && year <= 2100
                    ? year
                    : current.year,
            month:
                Number.isInteger(month) && month >= 1 && month <= 12
                    ? month
                    : current.month,
        };
    }, [searchParams]);

    const [user, setUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadActivityDetails = async () => {
            setLoading(true);
            setError("");

            try {
                const [usersResponse, activityResponse] =
                    await Promise.all([
                        getActivityUsers(
                            initialDate.year,
                            initialDate.month
                        ),
                        getUserActivity(
                            userId,
                            initialDate.year,
                            initialDate.month
                        ),
                    ]);

                if (!active) return;

                const users = usersResponse?.data?.users || [];
                const selectedUser = users.find(
                    (item) => String(item?._id) === String(userId)
                );

                setUser(selectedUser || null);
                setActivities(
                    activityResponse?.data?.activities || []
                );
            } catch (requestError) {
                if (!active) return;

                console.error(
                    "Unable to load activity details:",
                    requestError
                );

                setError(
                    requestError?.response?.data?.message ||
                        "Unable to load activity details."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        if (userId) {
            loadActivityDetails();
        }

        return () => {
            active = false;
        };
    }, [initialDate.month, initialDate.year, userId]);

    const monthLabel = new Intl.DateTimeFormat("en-IN", {
        month: "long",
        year: "numeric",
    }).format(
        new Date(initialDate.year, initialDate.month - 1, 1)
    );

    if (loading) {
        return (
            <main className="activity-details-page">
                <div className="activity-details-loading">
                    <Spinner
                        message="loading..."
                        size={45}
                    />
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="activity-details-page">
                <section className="activity-details-state activity-details-error">
                    <h1>Activity details unavailable</h1>
                    <p>{error}</p>

                    <button
                        type="button"
                        className="reports-secondary-button"
                        onClick={() => navigate("/admin/reports")}
                    >
                        Back to Reports
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="activity-details-page">
            <header className="activity-details-header">
                <BackButton
                    to="/admin/reports"
                    label="Back to Reports"
                    className="activity-details-back-button"
                />

                <div className="activity-details-user">
                    <img
                        className="activity-details-avatar"
                        src={
                            user?.avatar ||
                            "/profile/default-profile.svg"
                        }
                        alt=""
                    />

                    <div className="activity-details-user-info">
                        <h1>
                            {getFullName(user)}
                        </h1>

                        <p>
                            Activity for {monthLabel}
                        </p>
                    </div>
                </div>
            </header>

            <section className="activity-details-content">
                <div className="activity-details-summary">
                    <div>
                        <span className="activity-details-summary-label">
                            Total activities
                        </span>

                        <strong>
                            {activities.length}
                        </strong>
                    </div>

                    <div>
                        <span className="activity-details-summary-label">
                            Reporting month
                        </span>

                        <strong>
                            {monthLabel}
                        </strong>
                    </div>
                </div>

                <section className="activity-details-logs">
                    <div className="activity-details-section-heading">
                        <div>
                            <h2>Website Activity</h2>
                            <p>
                                Genuine activity records captured
                                during the selected month.
                            </p>
                        </div>
                    </div>

                    <ActivityLogList activities={activities} />
                </section>
            </section>
        </main>
    );
};

export default ActivityDetails;