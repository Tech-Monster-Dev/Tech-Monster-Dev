// src/services/api/adminStudentService.js

import api from "./axios";

export const getAllStudents = (params = {}) =>
    api.get("/admin/users", { params });

export const getStudentById = (id) =>
    api.get(`/admin/users/${id}`);

export const updateStudent = (id, data) =>
    api.put(`/admin/users/${id}`, data);

export const blockStudent = (id) =>
    api.patch(`/admin/users/${id}/block`);

export const unblockStudent = (id) =>
    api.patch(`/admin/users/${id}/unblock`);

export const deleteStudent = (id) =>
    api.delete(`/admin/users/${id}`);

export const restoreStudent = (id) =>
    api.patch(`/admin/users/${id}/restore`);
