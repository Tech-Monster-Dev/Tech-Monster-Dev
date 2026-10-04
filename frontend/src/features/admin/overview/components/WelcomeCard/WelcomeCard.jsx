import "./WelcomeCard.css";

import {
    HiUserGroup,
    HiCalendar,
    HiAcademicCap
} from "react-icons/hi";

export default function WelcomeCard({ stats }) {
    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    return (
        <div className="adminWelcomeCard">
            <div className="adminWelcomeLeft">
                <h1>
                    Welcome Back 👋
                </h1>

                <p>
                    Manage your internship platform from one place.
                </p>

                <span>
                    {today}
                </span>

            </div>

            <div className="adminWelcomeRight">
                <div className="adminWelcomeMiniCard">
                    <HiUserGroup />
                    <div>
                        <h3>
                            {stats.totalStudents}
                        </h3>
                        <p>
                            Students
                        </p>
                    </div>
                </div>

                <div className="adminWelcomeMiniCard">
                    <HiAcademicCap />
                    <div>
                        <h3>
                            {stats.activeInternships}
                        </h3>
                        <p>
                            Active Internships
                        </p>
                    </div>
                </div>

                <div className="adminWelcomeMiniCard">
                    <HiCalendar />
                    <div>
                        <h3>
                            {stats.activeStudents}
                        </h3>
                        <p>
                            Active Students
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}