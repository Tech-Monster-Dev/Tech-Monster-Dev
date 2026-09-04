import { useEffect, useState } from "react";

import "./Overview.css";

import api from "../../../services/api/axios";
import { API } from "../../../services/api/endpoints";

import WelcomeCard from './components/WelcomeCard';
import ServerStatus from './components/ServerStatus';
import StatsCards from "./components/StatsCards";
import ActiveStudents from "./components/ActiveStudents";
import LineChart from "./components/LineChart";
import AttendanceSummary from './components/AttendanceSummary';
import TopInternships from "./components/TopInternships";
import RecentTasks from "./components/RecentTasks";
import CertificateAnalytics from "./components/CertificateAnalytics";
import QuickActions from "./components/QuickActions";
import RecentActivities from "./components/RecentActivities";

import FadeInSection from "../../dashboard/common/FadeInSection";
import OverviewSkeleton from "./OverviewSkeleton";
import useSkeletonScrollLock from "../../../shared/hooks/useSkeletonScrollLock";

export default function Overview() {

    const [dashboard, setDashboard] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        fetchDashboard();

    }, []);

    const fetchDashboard = async () => {

        try {

            const { data } = await api.get(API.DASHBOARD.ADMIN);

            setDashboard(data.dashboard);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    };

    useSkeletonScrollLock(loading);

    if (loading) {
        return <OverviewSkeleton />;
    }

    if (!dashboard) {
        return <h2>Dashboard data not found.</h2>;
    }

    return (

        <>

            <div id="overviewContainer">
                <div id="overviewTop">
                    <FadeInSection>
                        <WelcomeCard
                            stats={dashboard.stats}
                        />
                    </FadeInSection>
                    <FadeInSection>
                        <ServerStatus />
                    </FadeInSection>
                </div>

                <FadeInSection>
                    <StatsCards
                        stats={dashboard.stats}
                    />
                </FadeInSection>

                <div id="overviewChart">
                    <FadeInSection>
                        <LineChart
                            chartData={dashboard.weeklyAttendance}
                        />
                    </FadeInSection>

                    <FadeInSection>
                        <AttendanceSummary
                            attendanceSummary={dashboard.attendanceSummary}
                        />
                    </FadeInSection>
                </div>

                <div id="overviewMiddle">
                    <FadeInSection>
                        <RecentActivities
                            activities={dashboard.recentActivities}
                        />
                    </FadeInSection>

                    <FadeInSection>
                        <ActiveStudents
                            students={dashboard.activeStudents}
                        />
                    </FadeInSection>

                </div>

                <div id="overviewBottom">
                    <FadeInSection>
                        <TopInternships
                            internships={dashboard.topInternships}
                        />
                    </FadeInSection>
                    <FadeInSection>
                        <RecentTasks
                            tasks={dashboard.recentTasks}
                        />
                    </FadeInSection>
                </div>

                <div id="overviewFooter">
                    <FadeInSection>
                        <CertificateAnalytics
                            analytics={dashboard.certificateAnalytics}
                        />
                    </FadeInSection>
                    <FadeInSection>
                        <QuickActions />
                    </FadeInSection>
                </div>

            </div>
        </>
    );
}