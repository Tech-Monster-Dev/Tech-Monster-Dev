import { ContinueLearningSkeleton, CourseSectionSkeleton, InternshipSectionSkeleton} from '../components/Skeleton';

import "./DashboardSkeleton.css";

const DashboardSkeleton = () => {
    return (
        <div className="dashboard-skeleton">


            <ContinueLearningSkeleton />

            <CourseSectionSkeleton />

            <InternshipSectionSkeleton />

        </div>
    );
};

export default DashboardSkeleton;