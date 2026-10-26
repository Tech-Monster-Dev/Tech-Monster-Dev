import "./StudentCard.css";
const defaultProfileImage = "/assets/profile/default-profile.svg";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import StudentActionButtons from "../StudentActionButtons";

export default function StudentCard({
    student,
    onRefresh,
    onEdit,
    onNotify
}) {

    const router = useRouter();

    return (
        <motion.div
            className="studentCard"
            initial={{
                opacity:0,
                y:30
            }}
            whileInView={{
                opacity:1,
                y:0
            }}
            viewport={{
                once:true
            }}
            transition={{
                duration:.45
            }}
        >
            <div
                className="studentCardTop"
                onClick={() => {
                    if (!student.isDeleted) {
                        router.push(`/admin/students/${student._id}`);
                    }
                }}
            >
                <img
                    src={
                        student.avatar && student.avatar !== "/assets/profile/default-profile.svg" ? student.avatar : defaultProfileImage
                    }
                    alt=""
loading="lazy" decoding="async"
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = defaultProfileImage;
                    }}
                />

                <div>
                    <h3>
                        {
                            student.firstName
                        } {
                            student.lastName
                        }
                    </h3>

                    <p>
                        {
                            student.email
                        }
                    </p>

                    <span>
                        @{
                            student.username
                        }
                    </span>
                </div>
            </div>

            <div className="studentStats">
                <div>
                    <h4>
                        {
                            student.year ||
                            "--"
                        }
                    </h4>

                    <span>
                        Year
                    </span>
                </div>

                <div>
                    <h4>
                        {
                            student.semester ||
                            "--"
                        }
                    </h4>

                    <span>
                        Semester
                    </span>
                </div>

                <div>
                    <h4>
                        {
                            student.branch ||
                            "--"
                        }
                    </h4>

                    <span>
                        Branch
                    </span>
                </div>
            </div>

            <StudentActionButtons
                student={student}
                onRefresh={onRefresh}
                onEdit={onEdit}
                onNotify={onNotify}
            />
        </motion.div>
    );
}