import "./StudentDetails.css";
import defaultProfileImage from "../../../../assets/profile/default-profile.svg";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../../../../services/api/axios";
import useSkeletonScrollLock from "../../../../shared/hooks/useSkeletonScrollLock";

import StudentDetailsSkeleton from "./StudentDetailsSkeleton";
import StudentHero from "./components/StudentHero";
import PersonalInformation from "./components/PersonalInformation";
import EducationInformation from "./components/EducationInformation";
import AddressInformation from "./components/AddressInformation";
import AccountInformation from "./components/AccountInformation";
import ProfessionalSocial from "./components/ProfessionalSocial";
import CoursesTable from "./components/CoursesTable";
import InternshipsTable from "./components/InternshipsTable";
import AttendanceTable from "./components/AttendanceTable";
import NotificationHistory from "./components/NotificationHistory";

const formatValue = (value, fallback = "Not provided") => {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    return String(value);
};

const formatDate = (value, fallback = "Not available") => {
    if (!value) {
        return fallback;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const formatDateTime = (value, fallback = "Not available") => {
    if (!value) {
        return fallback;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const getFullName = (student) => {
    const name = [
        student?.firstName,
        student?.middleName,
        student?.lastName
    ]
        .filter(Boolean)
        .join(" ");

    return name || student?.username || "Student";
};

const getProgramName = (item) => {
    if (item?.course?.title) {
        return item.course.title;
    }

    if (item?.internship?.title) {
        return item.internship.title;
    }

    return "Not associated";
};

const getProgramType = (item) => {
    if (item?.course) {
        return "Course";
    }

    if (item?.internship) {
        return "Internship";
    }

    return "Not associated";
};

export default function StudentDetails() {
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(null);
    const [courses, setCourses] = useState([]);
    const [internships, setInternships] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const fetchStudent = useCallback(async () => {
        try {
            setLoading(true);

            const res = await api.get(`/admin/users/${id}`);
            const data = res.data || {};

            setStudent(data.student || null);
            setCourses(data.courses || []);
            setInternships(data.internships || []);
            setAttendance(data.attendance || []);
            setNotifications(data.notifications || []);
        } catch (err) {
            console.error("Failed to fetch student:", err);

            setStudent(null);
            setCourses([]);
            setInternships([]);
            setAttendance([]);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        queueMicrotask(fetchStudent);
    }, [fetchStudent]);

    useSkeletonScrollLock(loading);

    if (loading) {
        return <StudentDetailsSkeleton />;
    }

    if (!student) {
        return (
            <div className="studentDetailsPage">
                <div className="detailCard studentDetailsError">
                    <h2>Student Details</h2>
                    <p>Unable to load the requested student.</p>
                </div>
            </div>
        );
    }

    const fullName = getFullName(student);

    const avatar =
        student.avatar &&
            student.avatar !== "/profile/default-profile.svg"
            ? student.avatar
            : defaultProfileImage;

    return (
        <div className="studentDetailsPage">
            <StudentHero
                student={student}
                fullName={fullName}
                avatar={avatar}
                defaultProfileImage={defaultProfileImage}
                formatValue={formatValue}
            />

            <div className="studentSectionGrid">
                <PersonalInformation
                    student={student}
                    formatDate={formatDate}
                    formatValue={formatValue}
                />

                <EducationInformation student={student} />

                <AddressInformation student={student} />

                <AccountInformation
                    student={student}
                    formatDateTime={formatDateTime}
                />

                <ProfessionalSocial student={student} />

                <CoursesTable
                    courses={courses}
                    formatValue={formatValue}
                    formatDate={formatDate}
                />

                <InternshipsTable
                    internships={internships}
                    formatValue={formatValue}
                    formatDate={formatDate}
                />

                <AttendanceTable
                    attendance={attendance}
                    formatDate={formatDate}
                    getProgramName={getProgramName}
                    getProgramType={getProgramType}
                />

                <NotificationHistory
                    notifications={notifications}
                    formatValue={formatValue}
                    formatDateTime={formatDateTime}
                />
            </div>
        </div>
    );
}