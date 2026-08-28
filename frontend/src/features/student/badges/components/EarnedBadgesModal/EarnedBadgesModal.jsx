export default function EarnedBadgesModal({
    badges,
    onClose
}) {
    return (
        <div
            className="earned-badges-overlay"
            onClick={onClose}
        >
            <div
                className="earned-badges-panel"
                onClick={event =>
                    event.stopPropagation()
                }
            >
                <div className="earned-badges-panel-header">
                    <div>
                        <span>🏆</span>

                        <div>
                            <h2>Earned Badges</h2>
                            <p>
                                Your achievement history
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="earned-badges-list">
                    {badges.length === 0 ? (
                        <div className="no-earned-badges">
                            <span>🏅</span>
                            <p>
                                No badges earned yet.
                            </p>
                        </div>
                    ) : (
                        badges.map(badge => (
                            <div
                                className="earned-badge-item"
                                key={badge._id}
                            >
                                <div className="earned-badge-icon">
                                    {badge.icon || "🏆"}
                                </div>

                                <div>
                                    <h3>
                                        {badge.title}
                                    </h3>

                                    <p>
                                        Attendance Achievement
                                    </p>

                                    <small>
                                        Earned:{" "}
                                        {badge.earnedAt
                                            ? new Date(
                                                  badge.earnedAt
                                              ).toLocaleDateString(
                                                  "en-IN",
                                                  {
                                                      day: "2-digit",
                                                      month: "short",
                                                      year: "numeric"
                                                  }
                                              )
                                            : "Recently"}
                                    </small>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
