import api from "./axios";

export const getAllInternships = () =>
    api.get("/internships");

export const getInternshipById = (id) =>
    api.get(`/internships/${id}`);

export const createInternship = (data) =>
    api.post("/internships", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const updateInternship = (id, data) =>
    api.put(`/internships/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const deleteInternship = (id) =>
    api.delete(`/internships/${id}`);

