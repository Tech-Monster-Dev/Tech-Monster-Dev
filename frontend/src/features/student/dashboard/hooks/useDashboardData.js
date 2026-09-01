import { useEffect, useState } from "react";

import api from "../../../../services/api/axios";
import { API } from "../../../../services/api/endpoints";
import { toast } from "react-toastify";

export default function useDashboardData() {
    const [dashboard, setDashboard] = useState({});
    const [loading, setLoading] = useState(false);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const { data } = await api.get(
                API.DASHBOARD.STUDENT
            );

            const dashboardData = data.dashboard;

            setDashboard(dashboardData);

            const enrolledItems = [
                ...(dashboardData?.internships || []).map(
                    (item) => ({
                        ...item,
                        type: "internship",
                    })
                ),

                ...(dashboardData?.courses || []).map(
                    (item) => ({
                        ...item,
                        type: "course",
                    })
                ),
            ];

            if (enrolledItems.length > 0) {
                const activeLearning = enrolledItems[0];

                localStorage.setItem(
                    "activeLearning",
                    JSON.stringify({
                        type: activeLearning.type,
                        slug: activeLearning.slug,
                        title: activeLearning.title,
                    })
                );
            }
        } catch (err) {
            console.log(err);

            toast.error(
                err?.response?.data?.message ||
                "Failed to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);


    return {
        loading,
        dashboard,
        setLoading,
        loadDashboard,
        api,
        API,
        toast
    };
}
