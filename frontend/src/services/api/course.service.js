import api from "./axios";

export const getAllCourses = () =>
    api.get("/courses");

export const getCourseById = (id) =>
    api.get(`/courses/${id}`);

export const createCourse = (data) =>
    api.post("/courses", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const updateCourse = (id, data) =>
    api.put(`/courses/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const deleteCourse = (id) =>
    api.delete(`/courses/${id}`);

