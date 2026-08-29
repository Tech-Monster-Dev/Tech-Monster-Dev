import "./ActiveStudents.css";
import EmptyState from "../../../../../components/ui/EmptyState";
import defaultProfileImage from "../../../../../assets/profile/default-profile.svg";

export default function ActiveStudents({ students = [] }) {

    return (

        <div id="activeStudents">

            <h2>Top Active Students</h2>

            <div id="activeStudentCards">

                {
                    students.length === 0 ? (

                        <EmptyState
                            heading="No Active Students"
                            paragraph="There are no active students to display right now."
                        />

                    ) : (

                        students.map((student) => (

                            <div
                                id="activeStudentCard"
                                key={student._id}
                            >

                                <img
                                    src={student.avatar && student.avatar !== "/profile/default-profile.svg" ? student.avatar : defaultProfileImage}
                                    onError={(event) => {
                                        event.currentTarget.src = defaultProfileImage;
                                    }}
                                    alt={student.fullName}
                                />

                                <div id="activeStudentInfo">

                                    <h4>{student.fullName}</h4>

                                    <span>
                                        {student.internshipTitle}
                                    </span>

                                    <div id="activeStudentProgressBar">

                                        <div
                                            id="activeStudentProgress"
                                            style={{
                                                width: `${student.progress}%`
                                            }}
                                        />

                                    </div>

                                    <small>
                                        {student.progress}% Completed
                                    </small>

                                </div>

                            </div>

                        ))

                    )
                }

            </div>

        </div>

    );

}