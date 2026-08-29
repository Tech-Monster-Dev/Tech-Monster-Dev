// Admin student details

import "./StudentDetails.css";

import {
    useCallback,
    useEffect,
    useState
} from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import api from "../../../../services/api/axios";
import StudentDetailsSkeleton from "./StudentDetailsSkeleton";

export default function StudentDetails() {

    const { id } = useParams();

    const [loading, setLoading] = useState(true);

    const [student, setStudent] = useState(null);

    const [internships, setInternships] = useState([]);

    const [attendance, setAttendance] = useState([]);

    const [tasks, setTasks] = useState([]);

    const [notifications, setNotifications] = useState([]);

    const fetchStudent = useCallback(async () => {

        try {

            setLoading(true);

            const res = await api.get(
                `/admin/users/${id}`
            );

            setStudent(res.data.student);

            setInternships(
                res.data.internships || []
            );

            setAttendance(
                res.data.attendance || []
            );

            setTasks(
                res.data.tasks || []
            );

            setNotifications(
                res.data.notifications || []
            );

        } catch (err) {

            console.error(
                "Failed to fetch student:",
                err
            );

        } finally {

            setLoading(false);

        }

    }, [id]);

    useEffect(() => {

        queueMicrotask(() => {
            fetchStudent();
        });

    }, [fetchStudent]);

    if (loading) {

        return <StudentDetailsSkeleton />;

    }

    return (

        <div className="studentDetailsPage">

            <motion.div

                className="studentHero"

                initial={{

                    opacity: 0,

                    y: 30

                }}

                animate={{

                    opacity: 1,

                    y: 0

                }}

            >

                <img

                    src={student.avatar || "/profile/default-profile.svg"}

                    alt=""

                />

                <div>

                    <h1>

                        {student.firstName} {student.lastName}

                    </h1>

                    <p>{student.email}</p>

                    <p>{student.phone}</p>

                    <span>

                        {student.branch} | {student.year}

                    </span>

                </div>

            </motion.div>

            <div className="studentSectionGrid">

                <div className="detailCard">

                    <h2>Profile</h2>

                    <p>Username : {student.username}</p>

                    <p>College : {student.college}</p>

                    <p>Education : {student.education}</p>

                    <p>Semester : {student.semester}</p>

                    <p>Gender : {student.gender}</p>

                    <p>Date Of Birth : {student.dateOfBirth}</p>

                    <p>Bio : {student.bio}</p>

                </div>

                <div className="detailCard">

                    <h2>Address</h2>

                    <p>{student.currentAddress}</p>

                    <p>{student.localAddress}</p>

                    <p>{student.district}</p>

                    <p>{student.state}</p>

                    <p>{student.pincode}</p>

                </div>

                <div className="detailCard">

                    <h2>Account</h2>

                    <p>Verified : {student.isVerified ? "Yes" : "No"}</p>

                    <p>Blocked : {student.isBlocked ? "Yes" : "No"}</p>

                    <p>Profile Complete : {student.profileCompleted ? "Yes" : "No"}</p>

                    <p>Role : {student.role}</p>

                </div>

                <div className="detailCard">

                    <h2>Social Links</h2>

                    <a href={student.github} target="_blank">

                        {student.github}

                    </a>

                    <a href={student.linkedin} target="_blank">

                        {student.linkedin}

                    </a>

                </div>

            </div>

            <div className="tableCard">

                <h2>Internships</h2>

                <table>

                    <thead>

                        <tr>

                            <th>Title</th>

                            <th>Status</th>

                            <th>Progress</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            internships.map(item => (

                                <tr key={item._id}>

                                    <td>{item.internship?.title}</td>

                                    <td>{item.status}</td>

                                    <td>{item.progress}%</td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

            <div className="tableCard">

                <h2>Attendance</h2>

                <table>

                    <thead>

                        <tr>

                            <th>Date</th>

                            <th>Status</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            attendance.map(item => (

                                <tr key={item._id}>

                                    <td>{item.createdAt}</td>

                                    <td>{item.status}</td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

            <div className="tableCard">

                <h2>Tasks</h2>

                <table>

                    <thead>

                        <tr>

                            <th>Task</th>

                            <th>Status</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            tasks.map(item => (

                                <tr key={item._id}>

                                    <td>{item.title}</td>

                                    <td>{item.status}</td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

            <div className="tableCard">

                <h2>Notification History</h2>

                <table>

                    <thead>

                        <tr>

                            <th>Title</th>

                            <th>Message</th>

                            <th>Read</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            notifications.map(item => (

                                <tr key={item._id}>

                                    <td>{item.title}</td>

                                    <td>{item.message}</td>

                                    <td>

                                        {

                                            item.isRead

                                                ? "Yes"

                                                : "No"

                                        }

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}
