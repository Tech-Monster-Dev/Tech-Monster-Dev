import { LearningCardSkeleton } from "../components/Skeleton";
import SectionTabs from "../../../../layouts/SectionTabs";

import "./DashboardSkeleton.css";

const DashboardSkeleton = () => {
    return (
        <div className="dashboard-skeleton">
            <SectionTabs
                tabs={[
                    { label: "Enrolled", value: "enrolled" },
                    { label: "Courses", value: "courses" },
                    { label: "Internships", value: "internships" },
                ]}
                activeTab="enrolled"
            />

            <div className="learning-card-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                    <LearningCardSkeleton
                        key={index}
                        showProgress
                    />
                ))}
            </div>
        </div>
    );
};

export default DashboardSkeleton;
