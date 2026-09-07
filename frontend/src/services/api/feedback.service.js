import api from "./axios";
import { API } from "./endpoints";

export const getWebsiteFeedback = async () => {
    const { data } = await api.get(API.FEEDBACK.WEBSITE);
    return data;
};

export const getMyCourseFeedback = async () => {
    const { data } = await api.get(API.FEEDBACK.MY_COURSE);
    return data;
};

export const getMyInternshipFeedback = async () => {
    const { data } = await api.get(API.FEEDBACK.MY_INTERNSHIP);
    return data;
};

export const submitFeedback = async (payload) => {
    const { data } = await api.post(
        API.FEEDBACK.SUBMIT,
        payload
    );

    return data;
};
