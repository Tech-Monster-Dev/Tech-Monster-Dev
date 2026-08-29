// StudentCard component

import "./StudentCard.css";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import StudentActionButtons from "../StudentActionButtons";

export default function StudentCard({

    student,

    onRefresh,

    onEdit,

    onNotify

}) {

    const navigate = useNavigate();

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

            whileHover={{

                y:-8,

                scale:1.02

            }}

        >

            <div

                className="studentCardTop"

                onClick={()=>

                    navigate(

                        `/admin/students/${student._id}`

                    )

                }

            >

                <img

                    src={

                        student.avatar ||

                        "/profile/default-profile.svg"

                    }

                    alt=""

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