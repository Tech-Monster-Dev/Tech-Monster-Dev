import "./SuggestedUsers.css";
import defaultProfileImage from "../../../../../assets/profile/default-profile.svg";

import { motion } from "framer-motion";
import EmptyState from "../../../../../components/ui/EmptyState";

import {
  HiUsers,
  HiArrowRight,
  HiCheckBadge,
} from "react-icons/hi2";


const SuggestedUsers = ({
  users = [],
}) => {

  return (
    <motion.section
      className="suggested-users"

      initial={{
        opacity: 0,
        y: 80,
      }}

      whileInView={{
        opacity: 1,
        y: 0,
      }}

      viewport={{
        once: true,
      }}

      transition={{
        duration: 0.8,
      }}
    >

      <div className="users-header">

        <div>

          <h2>
            <HiUsers />
            Suggested Users
          </h2>

          <p>
            Connect with learners having
            similar interests.
          </p>

        </div>


        <motion.button
          type="button"
          className="view-all-users"

          whileHover={{
            scale: 1.05,
          }}
        >
          View All
          <HiArrowRight />
        </motion.button>

      </div>


      {users.length === 0 ? (

        <EmptyState
          heading="No Suggested Users"
          paragraph="More suggestions will appear as you complete your profile."
        />

      ) : (

        <div className="users-grid">

          {users.map(
            (user, index) => (

              <motion.article
                key={
                  user?._id ||
                  index
                }

                className="user-card"

                initial={{
                  opacity: 0,
                  y: 50,
                }}

                whileInView={{
                  opacity: 1,
                  y: 0,
                }}

                transition={{
                  delay:
                    index * 0.15,
                }}

                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
              >

                <div className="user-top">

                  <div className="user-avatar">

                    <img
                      src={
                        user?.avatar && user.avatar !== "/profile/default-profile.svg"
                        ? user.avatar
                        : defaultProfileImage
                      }

                      alt={
                        user?.fullName ||
                        "User"
                      }

                      onError={(
                        event
                      ) => {
                        event.currentTarget.src =
                          defaultProfileImage;
                      }}
                    />

                    <span
                      className="online-dot"
                    />

                  </div>


                  <div className="user-info">

                    <h3>
                      {
                        user?.fullName ||
                        "Unknown User"
                      }
                    </h3>

                    <p>
                      {
                        user?.role ||
                        "Learner"
                      }
                    </p>

                  </div>

                </div>


                {user?.skills?.length > 0 && (
                  <div className="user-skills">

                    {user.skills
                      .slice(0, 6)
                      .map(
                        (
                          skill,
                          i
                        ) => (
                          <span
                            key={
                              `${skill}-${i}`
                            }
                          >
                            {skill}
                          </span>
                        )
                      )}

                  </div>
                )}


                <div className="mutual">

                  <HiCheckBadge />

                  {user?.mutual || 0}
                  {" "}
                  Mutual Skills

                </div>


                <div className="user-buttons">

                  <motion.button
                    type="button"
                    className="follow-btn"

                    whileHover={{
                      scale: 1.03,
                    }}
                  >
                    Follow
                  </motion.button>


                  <motion.button
                    type="button"
                    className="profile-btn"

                    whileHover={{
                      scale: 1.03,
                    }}
                  >
                    View Profile
                  </motion.button>

                </div>

              </motion.article>
            )
          )}

        </div>
      )}

    </motion.section>
  );
};

export default SuggestedUsers;