import "./Students.css";

import { useEffect, useMemo, useState } from "react";
import {getAllStudents} from "../../../services/api/adminStudentService";

import StudentCard from "./components/StudentCard";
import EditStudentModal from "./components/EditStudentModal";
import NotificationModal from "./components/NotificationModal";
import StudentSkeleton from "./components/StudentSkeleton";
import Skeleton from "../../dashboard/common/LoaderPage/Skeleton";
import useSkeletonScrollLock from "../../../shared/hooks/useSkeletonScrollLock";
import EmptyState from "../../../components/ui/EmptyState";
import SectionTabs from "../../../layouts/SectionTabs";

import { socket } from "../../../services/socket/socket";

export default function Students() {

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedTab, setSelectedTab] = useState("all");
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        const handleOnlineUsers = (users) => {
            setOnlineUsers(
                Array.isArray(users)
                    ? users
                    : []
            );
        };

        socket.on("onlineUsers", handleOnlineUsers);
        socket.emit("getOnlineUsers");

        return () => {
            socket.off("onlineUsers", handleOnlineUsers);
        };

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

    const activeStudents = useMemo(() => {

        return students.filter((student) =>
            onlineUsers.some((userId) =>
                String(userId) === String(student._id)
            )
        );

    }, [students, onlineUsers]);

    const filteredStudents = useMemo(() => {

        if (selectedTab === "active") {
            return students.filter((student) =>
                onlineUsers.some((userId) =>
                    String(userId) === String(student._id)
                )
            );
        }

        if (selectedTab === "blocked") {
            return students.filter((student) => student.isBlocked);
        }

        return students;

    }, [students, selectedTab, onlineUsers]);

    useSkeletonScrollLock(loading);

    if (loading) {
        return (
            <div className="studentsPage">
                <div className="studentTabsSkeleton">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            width="clamp(6.5rem, 18vw, 9rem)"
                            height="clamp(2.5rem, 6vw, 3rem)"
                            borderRadius="clamp(0.5rem, 1.5vw, 0.75rem)"
                        />
                    ))}
                </div>

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
                <SectionTabs
                    tabs={[
                        {
                            label: "All Student",
                            value: "all",
                            count: students.length
                        },
                        {
                            label: "Active Student",
                            value: "active",
                            count: activeStudents.length
                        },
                        {
                            label: "Blocked",
                            value: "blocked",
                            count: students.filter((student) => student.isBlocked).length
                        }
                    ]}
                    activeTab={selectedTab}
                    onChange={setSelectedTab}
                />

                {filteredStudents.length === 0 ? (
                    <EmptyState
                        fullPage
                        heading={
                            selectedTab === "active"
                                ? "No Active Students"
                                : selectedTab === "blocked"
                                    ? "No Blocked Students"
                                    : "No Students Yet"
                        }
                        paragraph={
                            selectedTab === "active"
                                ? "There are no students currently online on Tech Monster."
                                : selectedTab === "blocked"
                                    ? "There are no blocked students on Tech Monster right now."
                                    : "There are no students registered on Tech Monster right now."
                        }
                    />
                ) : (
                    <div className="studentGrid">
                        {filteredStudents.map((student) => (
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