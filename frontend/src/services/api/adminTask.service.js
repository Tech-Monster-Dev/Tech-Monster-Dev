import api from "./axios";
import { API } from "./endpoints";

export const getApprovedTasks = async () => {

    const res = await api.get(
        API.ADMIN.TASKS.APPROVED
    );

    return res.data;

};

export const getPendingTasks = async () => {

    const { data } = await api.get(API.ADMIN.TASKS.PENDING);

    return data;

};

export const getTaskDetails = async (id) => {

    const { data } = await api.get(API.ADMIN.TASKS.DETAILS(id));

    return data;

};

export const approveTask = async (id, comment) => {

    const { data } = await api.patch(

        API.ADMIN.TASKS.APPROVE(id),

        {

            comment

        }

    );

    return data;

};

export const rejectTask = async (id, comment) => {

    const { data } = await api.patch(

        API.ADMIN.TASKS.REJECT(id),

        {

            comment

        }

    );

    return data;

};

// ===============================
// Student Submit Task
// ===============================

export const submitTask = async (id, payload) => {

    const { data } = await api.patch(

        `/tasks/${id}/status`,

        payload

    );

    return data;

};

export const getMyTasks = async () => {

    const { data } = await api.get(

        "/tasks/my-tasks"

    );

    return data;

};


export const getSingleTask = async (id) => {

    const { data } = await api.get(

        `/tasks/my-tasks/${id}`

    );

    return data;

};

// ===============================
// Admin Submission Review (new flow)
// ===============================

export const getAllSubmissions = async (status) => {

    const { data } = await api.get(API.ADMIN.SUBMISSIONS.BASE, {

        params: status ? { status } : {}

    });

    return data;

};

export const getSubmissionDetails = async (id) => {

    const { data } = await api.get(API.ADMIN.SUBMISSIONS.DETAILS(id));

    return data;

};

export const getSubmissionByTaskId = async (taskId) => {

    const { data } = await api.get(

        API.ADMIN.SUBMISSIONS.BY_TASK(taskId)

    );

    return data;

};

export const approveSubmission = async (id, comment) => {

    const { data } = await api.put(

        API.ADMIN.SUBMISSIONS.APPROVE(id),

        { comment }

    );

    return data;

};

export const rejectSubmission = async (id, comment) => {

    const { data } = await api.put(

        API.ADMIN.SUBMISSIONS.REJECT(id),

        { comment }

    );

    return data;

};

export const extendSubmissionDeadline = async (id, hours = 48) => {

    const { data } = await api.put(

        API.ADMIN.SUBMISSIONS.EXTEND(id),

        { hours }

    );

    return data;

};
