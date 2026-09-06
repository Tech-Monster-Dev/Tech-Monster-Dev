import {
  motion,
  AnimatePresence
} from "framer-motion";

export default function ProfileActions({
  isFollowing,
  onFollowToggle,
  onMessage,
  actionLoading
}) {

  return (

    <div className="actions-wrapper">

      <motion.button
        whileHover={
          !actionLoading
            ? { scale: 1.05 }
            : {}
        }
        whileTap={
          !actionLoading
            ? { scale: 0.95 }
            : {}
        }
        onClick={onFollowToggle}
        disabled={actionLoading}
        className={`btn-custom ${isFollowing
            ? "btn-following"
            : "btn-follow"
          }`}
      >

        {actionLoading
          ? "Please wait..."
          : isFollowing
            ? "✓ Following"
            : "+ Follow"
        }

      </motion.button>

      <AnimatePresence>

        {isFollowing && (

          <motion.button
            initial={{
              opacity: 0,
              scale: 0.8,
              x: -10
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              x: -10
            }}
            whileHover={{
              scale: 1.05
            }}
            whileTap={{
              scale: 0.95
            }}
            className="btn-custom btn-message"
            onClick={onMessage}
            disabled={actionLoading}
          >

            💬 Message

          </motion.button>

        )}

      </AnimatePresence>

    </div>
  );
}