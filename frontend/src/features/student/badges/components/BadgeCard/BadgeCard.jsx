import { motion } from "framer-motion";

export default function BadgeCard({
  definition,
  earnedBadge
}) {
  const unlocked = Boolean(earnedBadge);

  const emoji =
    earnedBadge?.icon ||
    definition.emoji;

  const description =
    earnedBadge?.description ||
    definition.description;

  const requirement =
    earnedBadge?.requirement ||
    definition.requirement;

  return (
    <motion.div
      className={`achievement-badge ${
        unlocked
          ? "achievement-badge-earned"
          : "achievement-badge-locked"
      }`}
      style={
        unlocked
          ? {
              "--badge-color":
                earnedBadge.color ||
                "#FFD700"
            }
          : undefined
      }
      whileHover={{
        y: -7,
        scale: 1.035
      }}
      transition={{
        duration: 0.22
      }}
    >
      <div className="achievement-sticker">
        <span>{emoji}</span>

        {!unlocked && (
          <div className="locked-shade">
            LOCKED
          </div>
        )}
      </div>

      <div className="achievement-info">
        <h3>{definition.title}</h3>

        <p>{description}</p>
      </div>

      <div className="achievement-tooltip">
        <strong>
          {unlocked
            ? "🏆 Achievement Earned"
            : "🔒 How to Earn"}
        </strong>

        <span>{requirement}</span>
      </div>
    </motion.div>
  );
}
