import api from "./axios";
import { API } from "./endpoints";

export const getNotices = async () => {
    const { data } = await api.get(API.NOTICE.BASE);
    return data;
};

export const createNotice = async (formData) => {
    const { data } = await api.post(
        API.NOTICE.BASE,
        formData
    );

    return data;
};

export const updateNotice = async (id, formData) => {
    const { data } = await api.put(
        API.NOTICE.BY_ID(id),
        formData
    );

    return data;
};

export const deleteNotice = async (id) => {
    const { data } = await api.delete(
        API.NOTICE.BY_ID(id)
    );

    return data;
};
