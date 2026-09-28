import { motion } from "framer-motion";
import StudentBadgeAvatar from "../../../../../dashboard/common/StudentBadgeAvatar";

export default function ProfileHeader({
    data,
    latestBadge = null,
    imageLoading,
    handleImageUpdate
}) {

    return (
        <motion.div
            className="profile-header"
            initial={{
                opacity: 0,
                y: 15
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            transition={{
                duration: 0.4
            }}
        >
            {/* ============================== */}
            {/* AVATAR */}
            {/* ============================== */}

            <div className="profile-avatar-section">
                <div className="profile-avatar-wrapper">
                    <StudentBadgeAvatar
                        avatar={data?.avatar}
                        latestBadge={latestBadge}
                        alt="Profile"
                        className="profile-large-badge-avatar"
                    />

                    {imageLoading && (
                        <div className="avatar-loading">
                            Uploading...
                        </div>
                    )}
                </div>

                <label
                    htmlFor="profile-image-input"
                    className="edit-photo-btn"
                >
                    {imageLoading
                        ? "Uploading..."
                        : "Edit Photo"
                    }

                    <input
                        id="profile-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpdate}
                        disabled={imageLoading}
                    />
                </label>
            </div>
            {/* ============================== */}
            {/* PROFILE INFO */}
            {/* ============================== */}

            <div className="profile-header-info">
                <div className="profile-name-row">
                    <h2>
                        {data?.firstName || ""}
                        {" "}
                        {data?.lastName || ""}
                    </h2>

                    <span className="profile-username">
                        @{data?.username || "username"}
                    </span>
                </div>

                <p className="profile-email">
                    {data?.email || "No email"}
                </p>

                {/* ============================== */}
                {/* STATS */}
                {/* ============================== */}
                <div className="profile-stats-row">
                    <div className="profile-stat">
                        <strong>
                            {data?.profileStats?.followersCount || 0}
                        </strong>

                        <span>
                            Followers
                        </span>
                    </div>

                    <div className="profile-stat">
                        <strong>
                            {data?.profileStats?.followingCount || 0}
                        </strong>

                        <span>
                            Following
                        </span>
                    </div>

                    <div className="profile-stat">
                        <strong>
                            {data?.profileStats?.completedInternships || 0}
                            {" / "}
                            {data?.profileStats?.totalInternships || 0}
                        </strong>

                        <span>
                            Internships
                        </span>
                    </div>

                    <div className="profile-stat">
                        <strong>
                            {data?.profileStats?.completedCourses ?? 0}
                            {" / "}
                            {data?.profileStats?.totalCourses ?? 0}
                        </strong>

                        <span>
                            Courses
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}