import api from "./axios";


export const getMyAttendance = async () => {
    const { data } = await api.get(
        "/attendance/my-attendance"
    );
    return data;
};
export const recordActiveTime = async (activeSeconds) => {
    const { data } = await api.post(
        "/attendance/active-time",
        {
            activeSeconds
        }
    );

    return data;
};
