import { motion } from "framer-motion";
import EmptyState from "../../../../../../components/ui/EmptyState";

export default function BadgesSection({
  badges = [],
  loading = false
}) {
  return (
    <motion.div
      id="badges-profile-box"
      initial={{
        opacity: 0,
        y: 15
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
    >
      <label>
        Badges
      </label>

      {loading ? (
        <div id="badges-row">
          <span className="profile-badge-empty">
            Loading badges...
          </span>
        </div>
      ) : badges.length === 0 ? (
        <div id="badges-row">
          <EmptyState
            heading="No Badges Yet"
            paragraph="You have not earned any badges yet."
          />
        </div>
      ) : (
        <div id="badges-row">
          {badges.map(userBadge => {
            const badge = userBadge?.badge;

            if (!badge) {
              return null;
            }

            return (
              <motion.div
                key={
                  userBadge._id ||
                  badge._id ||
                  badge.title
                }
                className="profile-badge"
                whileHover={{
                  y: -4,
                  scale: 1.08
                }}
                transition={{
                  duration: 0.2
                }}
                title={
                  badge.requirement ||
                  badge.description ||
                  badge.title
                }
              >
                <span className="profile-badge-emoji">
                  {badge.icon || "🏅"}
                </span>

                <div className="profile-badge-tooltip">
                  <strong>
                    {badge.title}
                  </strong>

                  <span>
                    {badge.requirement ||
                      badge.description ||
                      "Achievement earned."}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
