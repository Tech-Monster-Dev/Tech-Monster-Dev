import "./Overview.css";
import { useEffect, useState } from "react";


import api from "../../../services/api/axios";
import { API } from "../../../services/api/endpoints";
import { socket } from "../../../services/socket/socket";

import WelcomeCard from './components/WelcomeCard';
import ServerStatus from './components/ServerStatus';
import StatsCards from "./components/StatsCards";
import LineChart from "./components/LineChart";
import AttendanceSummary from './components/AttendanceSummary';

import OverviewSkeleton from "./OverviewSkeleton";
import useSkeletonScrollLock from "../../../shared/hooks/useSkeletonScrollLock";

export default function Overview() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        fetchDashboard();

        const handleOnlineUsers = () => {
            fetchDashboard();
        };

        socket.on("onlineUsers", handleOnlineUsers);

        return () => {
            socket.off("onlineUsers", handleOnlineUsers);
        };
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
            <div className="overviewContainer">
                <div className="overviewTop">
                    <WelcomeCard
                        stats={dashboard.stats}
                    />
                    <ServerStatus />
                </div>

                <StatsCards
                    stats={dashboard.stats}
                />

                <div className="overviewChart">
                    <LineChart
                        chartData={dashboard.weeklyAttendance}
                    />

                    <AttendanceSummary
                        attendanceSummary={dashboard.attendanceSummary}
                    />
                </div>
            </div>
        </>
    );
}