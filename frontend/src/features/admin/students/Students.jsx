// Admin students page

import "./Students.css";

import { useEffect, useState } from "react";

import {
    getAllStudents
} from "../../../services/api/adminStudentService";

import StudentCard from "./components/StudentCard";
import EditStudentModal from "./components/EditStudentModal";
import NotificationModal from "./components/NotificationModal";
import StudentSkeleton from "./components/StudentSkeleton";
import EmptyState from "../../../components/ui/EmptyState";

export default function Students() {

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {

        fetchStudents();

    }, []);

    async function fetchStudents() {

        try {

            const res = await getAllStudents({

                role: "student",

                limit: 100

            });

            setStudents(res.data.users);

        }

        finally {

            setLoading(false);

        }

    }

    if (loading) {

        return (
            <div className="studentsPage">

                <div className="studentGrid">

                    {Array.from({ length: 6 }).map((_, index) => (
                        <StudentSkeleton key={index} />
                    ))}

                </div>

            </div>
        );

    }

    return (

        <>

            <div className="studentsPage">
                {students.length === 0 ? (
                    <EmptyState
                        fullPage
                        heading="No Students Yet"
                        paragraph="There are no students registered on Tech Monster right now."
                    />
                ) : (
                    <div className="studentGrid">
                        {students.map((student) => (
                            <StudentCard
                                key={student._id}
                                student={student}
                                onRefresh={fetchStudents}
                                onEdit={(user) => {
                                    setSelectedStudent(user);
                                    setEditOpen(true);
                                }}

                                onNotify={(user) => {
                                    setSelectedStudent(user);
                                    setNotifyOpen(true);
                                }}
                            />

                        ))}
                    </div>
                )}
            </div>

            <EditStudentModal
                open={editOpen}
                student={selectedStudent}
                onClose={() => setEditOpen(false)}
                onRefresh={fetchStudents}
            />

            <NotificationModal
                open={notifyOpen}
                student={selectedStudent}
                onClose={() => setNotifyOpen(false)}

            />

        </>

    );

}