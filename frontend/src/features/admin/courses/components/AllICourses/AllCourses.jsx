import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import DeleteModal from "../../../../../components/ui/DeleteModal";
import EmptyState from "../../../../../components/ui/EmptyState";

import CourseCard from "../CourseCard";
import InternshipSkeleton from "../../../internships/components/InternshipSkeleton";
import useSkeletonScrollLock from "../../../../../shared/hooks/useSkeletonScrollLock";

import {
    getAllCourses,
    deleteCourse
} from "../../../../../services/api/course.service.js";

import "./AllCourses.css";


export default function AllCourses() {


    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);

    useSkeletonScrollLock(loading);

    const fetchCourses = async () => {

        try {
            const res = await getAllCourses();
            setCourses(res.data.courses);
        }
        catch {

            toast.error(
                "Failed to load courses"
            );

        }
        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        queueMicrotask(() => {
            fetchCourses();
        });

    }, []);




    const handleDelete = async (id) => {


        try {
            await deleteCourse(id);
            setCourses(
                prev => prev.filter(
                    item => item._id !== id
                )
            );
            toast.success(
                "Course deleted successfully"
            );
        }
        catch (error) {
            console.error("Delete failed:", error);

            toast.error(
                "Delete failed"
            );

        }


    };



    return (

        <div
            id="allCourses"
            className="fade-scroll"
        >


            <div id="allCoursesHeader">

                <h1>
                    All Courses
                </h1>


                <Link
                    to="/admin/course-form"
                    className="add-course-btn"
                >
                    + Add Course
                </Link>
            </div>

            {courses.length === 0 ? (
                <EmptyState
                    heading="No Courses Yet"
                    paragraph="There are no courses available right now. Add a course to start building the learning catalog."
                />
            ) : (
                <div id="allCoursesCards">
                    {loading ? (
                        <InternshipSkeleton />
                    ) : (
                        <CourseCard
                            courses={courses}
                            onDelete={(id) => setDeleteId(id)}
                        />
                    )}
                    <DeleteModal
                        open={deleteId !== null}
                        onCancel={() => setDeleteId(null)}
                        onConfirm={() => {
                            handleDelete(deleteId);
                            setDeleteId(null);
                        }}
                    />
                </div>
            )}
        </div>
    )
}
