import { motion } from "framer-motion";

export default function ProfileHeader({
    data,
    imageLoading,
    handleImageUpdate
}) {

    console.log("Profile stats", data?.profileStats);

    return (
        <motion.div
            id="profile-header"

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

            <div id="profile-avatar-section">

                <div id="profile-avatar-wrapper">

                    <img
                        src={
                            data?.avatar ||
                            "/profile/default-profile.svg"
                        }

                        alt="Profile"

                        id="profile-large-avatar"
                    />


                    {imageLoading && (

                        <div id="avatar-loading">
                            Uploading...
                        </div>

                    )}

                </div>


                <label
                    htmlFor="profile-image-input"
                    id="edit-photo-btn"
                >

                    {imageLoading
                        ? "Uploading..."
                        : "Edit Photo"
                    }


                    <input
                        id="profile-image-input"

                        type="file"

                        accept="image/*"

                        onChange={
                            handleImageUpdate
                        }

                        disabled={imageLoading}
                    />

                </label>

            </div>


            {/* ============================== */}
            {/* PROFILE INFO */}
            {/* ============================== */}

            <div id="profile-header-info">

                <div id="profile-name-row">
                    <h2>
                        {data?.firstName || ""}
                        {" "}
                        {data?.lastName || ""}
                    </h2>

                    <span id="profile-username">
                        @{data?.username || "username"}
                    </span>
                </div>

                <p id="profile-email">
                    {data?.email || "No email"}
                </p>

                {/* ============================== */}
                {/* STATS */}
                {/* ============================== */}

                <div id="profile-stats-row">

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
                        <span>Courses</span>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}