import "./Home.css";

import { useEffect, useState } from "react";
import {toast} from "react-toastify";

import api from "../../../services/api/axios";
import { API } from "../../../services/api/endpoints";

import WelcomeCard from "./components/WelcomeCard";
import ProfileSummary from "./components/ProfileSummary";
import StatsCards from "./components/StatsCards";
import InternshipRecommendation from "./components/InternshipRecommendation";
import SuggestedUsers from "./components/SuggestedUsers";
import LearningStreak from "./components/LearningStreak";
import LearningAnalytics from "./components/LearningAnalytics";

import Skeleton from "../../dashboard/common/LoaderPage/Skeleton";


const Home = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const response = await api.get(API.DASHBOARD.STUDENT);

      setDashboard(response.data?.dashboard || null);
    } catch (error) {
      
      console.error("Status:", error.response?.status);
      toast.error(error.response?.data?.message || "Something went wrong");

      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="home-page home-skeleton">

        {/* Welcome */}
        <div className="skeleton-welcome">
          <div className="skeleton-welcome-content">
            <Skeleton width="180px" height="28px" />
            <Skeleton width="280px" height="18px" />
            <Skeleton width="120px" height="18px" />
          </div>

          <Skeleton
            width="80px"
            height="80px"
            borderRadius="50%"
          />
        </div>

        {/* Profile */}
        <div className="skeleton-profile">
          <Skeleton width="160px" height="24px" />
          <Skeleton width="100%" height="18px" />
          <Skeleton width="75%" height="18px" />
        </div>

        {/* Stats */}
        <div className="skeleton-stats">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton
              key={item}
              height="120px"
              borderRadius="16px"
            />
          ))}
        </div>

        {/* Streak */}
        <Skeleton
          width="100%"
          height="180px"
          borderRadius="16px"
        />

        {/* Analytics */}
        <Skeleton
          width="100%"
          height="300px"
          borderRadius="16px"
        />

        {/* Internships */}
        <div className="skeleton-section">
          <Skeleton width="220px" height="25px" />

          <div className="skeleton-internships">
            {[1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                height="180px"
                borderRadius="16px"
              />
            ))}
          </div>
        </div>

        {/* Users */}
        <div className="skeleton-section">
          <Skeleton width="180px" height="25px" />

          <Skeleton
            width="100%"
            height="100px"
            borderRadius="16px"
          />
        </div>
      </div>
    );
  }

  const analytics = {
    completedCourses:
      dashboard?.analytics?.completedCourses || 0,

    hours:
      dashboard?.analytics?.hours || 0,

    growth:
      dashboard?.analytics?.growth || 0,

    weeklyData:
      dashboard?.analytics?.weeklyData?.length === 7
        ? dashboard.analytics.weeklyData
        : [0, 0, 0, 0, 0, 0, 0],
  };

  return (
    <main className="home-page">

      <WelcomeCard
        username={dashboard?.user}
        stats={dashboard?.stats}
        streak={dashboard?.streak}
      />

      <ProfileSummary
        username={dashboard?.user}
      />

      <StatsCards
        stats={dashboard?.stats}
      />

      <LearningStreak
        streak={dashboard?.streak}
      />

      <LearningAnalytics
        analytics={analytics}
      />

      <InternshipRecommendation
        internships={
          dashboard?.recommendedInternships || []
        }
      />

      <SuggestedUsers
        users={
          dashboard?.suggestedUsers || []
        }
      />

    </main>
  );
};

export default Home;