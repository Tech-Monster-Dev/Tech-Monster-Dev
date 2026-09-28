import "./StudentBadgeAvatar.css";
import defaultProfileImg from "../../../../assets/profile/default-profile.svg";

export default function StudentBadgeAvatar({
    avatar,
    latestBadge = null,
    alt = "Student profile",
    className = ""
}) {
    const profileImage =
        avatar && avatar !== "/profile/default-profile.svg"
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
                onError={(event) => {
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
