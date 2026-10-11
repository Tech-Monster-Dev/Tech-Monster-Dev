import api from "./axios";


export const getMyAttendance = async () => {
    const { data } = await api.get(
        "/attendance/my-attendance"
    );
    return data;
};

export const recordActiveTime = async (
    activeSeconds,
    dateKey = null
) => {
    const { data } = await api.post(
        "/attendance/active-time",
        {
            activeSeconds,
            ...(dateKey ? { dateKey } : {})
        }
    );

    return data;
};