import "./Dashboard.css";

import { useEffect, useState } from "react";

import DashboardHeader from "./components/DashboardHeader";
import ContinueLearning from "./components/ContinueLearning";
import AllInternship from "./components/AllInternship";
import AllCourses from "./components/AllCourses";

import DashboardSkeleton from "./DashboardSkeleton";

import api from "../../../services/api/axios";
import { API } from "../../../services/api/endpoints";
import { toast } from "react-toastify";

function Dashboard() {

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);


    const loadDashboard = async () => {

        try {

            setLoading(true);

            const { data } = await api.get(
                API.DASHBOARD.STUDENT
            );

            const dashboardData = data.dashboard;

            setDashboard(dashboardData);

            const enrolledItems = [
                ...(dashboardData?.internships || []).map(item => ({
                    ...item,
                    type: "internship"
                })),

                ...(dashboardData?.courses || []).map(item => ({
                    ...item,
                    type: "course"
                }))
            ];

            if (enrolledItems.length > 0) {
                const activeLearning = enrolledItems[0];

                localStorage.setItem(
                    "activeLearning",
                    JSON.stringify({
                        type: activeLearning.type,
                        slug: activeLearning.slug,
                        title: activeLearning.title
                    })
                );
            }

        } catch (err) {
            console.log(err);
            toast.error("Failed to load dashboard", err?.message);

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard();

    }, []);


    return (
        <div className="dashboard-page">

            {loading ? (

                <DashboardSkeleton />

            ) : (

                <>

                    <DashboardHeader />

                    <ContinueLearning
                        learningItems={[
                            ...(dashboard?.internships || []),
                            ...(dashboard?.courses || [])
                        ]}
                    />

                    <AllCourses
                        setLoading={setLoading}
                        courses={
                            dashboard?.allCourses || []
                        }
                        refreshDashboard={loadDashboard}
                    />

                    <AllInternship
                        loading={loading}
                        internships={
                            dashboard?.allInternships || []
                        }
                        refreshDashboard={loadDashboard}
                    />

                </>

            )}

        </div>
    );
}

export default Dashboard;