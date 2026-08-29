import "./RecentUpdates.css";
import EmptyState from "../../../../../components/ui/EmptyState";

import { HiUserAdd } from "react-icons/hi";

export default function RecentUpdates({ students = [] }) {

    return (

        <div id="recentUpdates">

            <div className="recentHeader">

                <h2>Recent Updates</h2>

            </div>

            <div id="recentNotification">

                {

                    students.length === 0 ?

                        <EmptyState
                            heading="No Recent Activity"
                            paragraph="There are no recent updates to display right now."
                        />

                        :

                        students.map((student) => (

                            <div

                                className="recentNotificationList"

                                key={student._id}

                            >

                                <div className="recentAvatar">

                                    <img

                                        src={student.avatar || "/profile/default-profile.svg"}

                                        alt={student.firstName}

                                    />

                                </div>

                                <div className="recentNotificationContent">

                                    <h4>

                                        {student.firstName} {student.lastName}

                                    </h4>

                                    <p>

                                        Joined TechMonster

                                    </p>

                                </div>

                                <div className="recentIcon">

                                    <HiUserAdd />

                                </div>

                            </div>

                        ))

                }

            </div>

        </div>

    );

}