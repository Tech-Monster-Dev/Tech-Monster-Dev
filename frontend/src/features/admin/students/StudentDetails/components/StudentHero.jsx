import { motion } from "framer-motion";

import BackButton from "../../../../../components/ui/Button/BackButton/BackButton";
import StatusBadge from "./StatusBadge";

const StudentHero = ({
    student,
    fullName,
    avatar,
    defaultProfileImage,
    formatValue
}) => (
    <motion.section
        className="studentHero"
        initial={{
            opacity: 0,
            y: 24
        }}
        animate={{
            opacity: 1,
            y: 0
        }}
        transition={{
            duration: 0.35
        }}
    >
        <BackButton
            to="/admin/students"
            label="Back to Manage Students"
            className="studentDetailsBackButton"
        />

        <div className="studentHeroIdentity">
            <img
                src={avatar}
                alt={`${fullName} profile`}
                onError={(event) => {
                    event.currentTarget.src = defaultProfileImage;
                }}
            />

            <div className="studentHeroInfo">
                <div className="studentHeroTitleRow">
                    <div>
                        <h1>{fullName}</h1>

                        <p>
                            @{formatValue(
                                student.username,
                                "student"
                            )}
                        </p>
                    </div>

                    <StatusBadge
                        value={
                            student.isBlocked
                                ? "Blocked"
                                : "Active"
                        }
                        type={
                            student.isBlocked
                                ? "danger"
                                : "success"
                        }
                    />
                </div>

                <div className="studentHeroMeta">
                    <span>
                        {formatValue(student.email)}
                    </span>

                    <span>
                        {formatValue(student.phone)}
                    </span>

                    <span>
                        {formatValue(
                            student.branch,
                            "Branch not provided"
                        )}

                        {student.year
                            ? ` • ${student.year}`
                            : ""}
                    </span>
                </div>
            </div>
        </div>
    </motion.section>
);

export default StudentHero;
