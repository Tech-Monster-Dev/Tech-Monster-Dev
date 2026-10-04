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

    const MODAL_STORAGE_KEY = "adminStudentsModal";

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setEditOpen(true);
        setNotifyOpen(false);

        sessionStorage.setItem(
            MODAL_STORAGE_KEY,
            JSON.stringify({
                type: "edit",
                studentId: student._id,
            })
        );
    };

    const openNotificationModal = (student) => {
        setSelectedStudent(student);
        setNotifyOpen(true);
        setEditOpen(false);

        sessionStorage.setItem(
            MODAL_STORAGE_KEY,
            JSON.stringify({
                type: "notification",
                studentId: student._id,
            })
        );
    };

    const closeEditModal = () => {
        setEditOpen(false);
        sessionStorage.removeItem(MODAL_STORAGE_KEY);
    };

    const closeNotificationModal = () => {
        setNotifyOpen(false);
        sessionStorage.removeItem(MODAL_STORAGE_KEY);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (!students.length || editOpen || notifyOpen) return;

        const savedModal = sessionStorage.getItem(MODAL_STORAGE_KEY);

        if (!savedModal) return;

        try {
            const { type, studentId } = JSON.parse(savedModal);

            const student = students.find(
                (item) => String(item._id) === String(studentId)
            );

            if (!student) {
                sessionStorage.removeItem(MODAL_STORAGE_KEY);
                return;
            }

            setSelectedStudent(student);

            if (type === "edit") {
                setEditOpen(true);
            } else if (type === "notification") {
                setNotifyOpen(true);
            } else {
                sessionStorage.removeItem(MODAL_STORAGE_KEY);
            }
        } catch {
            sessionStorage.removeItem(MODAL_STORAGE_KEY);
        }
    }, [students, editOpen, notifyOpen]);

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

    const availableStudents = useMemo(() => {
        return students.filter((student) => !student.isBlocked);
    }, [students]);

    const activeStudents = useMemo(() => {

        return availableStudents.filter((student) =>
            onlineUsers.some((userId) =>
                String(userId) === String(student._id)
            )
        );

    }, [availableStudents, onlineUsers]);

    const filteredStudents = useMemo(() => {

        if (selectedTab === "active") {
            return activeStudents;
        }

        if (selectedTab === "blocked") {
            return students.filter((student) => student.isBlocked);
        }

        return availableStudents;

    }, [
        students,
        selectedTab,
        activeStudents,
        availableStudents
    ]);

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
                            count: availableStudents.length
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
                                onEdit={openEditModal}

                                onNotify={openNotificationModal}
                            />

                        ))}
                    </div>
                )}
            </div>

            <EditStudentModal
                open={editOpen}
                student={selectedStudent}
                onClose={closeEditModal}
                onRefresh={fetchStudents}
            />

            <NotificationModal
                open={notifyOpen}
                student={selectedStudent}
                onClose={closeNotificationModal}
            />
        </>
    );
}