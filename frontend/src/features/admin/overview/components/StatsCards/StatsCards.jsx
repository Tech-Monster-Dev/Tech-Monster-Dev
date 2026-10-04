import "./StatsCards.css";

import {
    HiUserGroup,
    HiFolder,
    HiCalendar
} from "react-icons/hi";

export default function StatsCards({ stats }) {

    const cards = [
        {
            icon: <HiUserGroup />,
            title: "Total Students",
            value: stats.totalStudents
        },
        {
            icon: <HiFolder />,
            title: "Active Internships",
            value: stats.activeInternships
        },
        {
            icon: <HiCalendar />,
            title: "Certificates",
            value: stats.totalCertificates
        }
    ];

    return (
        <div className="adminStatsCards">
            {
                cards.map((card, index) => (
                    <div
                        className="adminStatsCard"
                        key={index}
                    >
                        <div className="adminStasCardIcon">
                            {card.icon}
                        </div>
                        <div className="adminStasCardInfo">
                            <h4>
                                {card.title}
                            </h4>
                            <h2>
                                {card.value}
                            </h2>
                        </div>
                    </div>
                ))
            }
        </div>
    );
}