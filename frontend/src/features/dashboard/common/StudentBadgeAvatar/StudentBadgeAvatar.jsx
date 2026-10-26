import "./StudentBadgeAvatar.css";

const defaultProfileImg = "/assets/profile/default-profile.svg";

export default function StudentBadgeAvatar({
    avatar,
    latestBadge = null,
    alt = "Student profile",
    className = ""
}) {
    const profileImage =
        avatar && avatar !== "/assets/profile/default-profile.svg"
            ? avatar
            : defaultProfileImg;

    return (
        <div
            className={`student-badge-avatar ${className}`.trim()}
        >
            <img
                src={profileImage}
                alt={alt}
                className="student-badge-avatar__image"
                loading="lazy"
                decoding="async"
                onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = defaultProfileImg;
                }}
            />

            {latestBadge?.icon && (
                <span
                    className="student-badge-avatar__badge"
                    title={latestBadge.title || "Latest badge"}
                    aria-label={
                        latestBadge.title
                            ? `Latest badge: ${latestBadge.title}`
                            : "Latest earned badge"
                    }
                >
                    {latestBadge.icon}
                </span>
            )}
        </div>
    );
}
