import EmptyState from "../../../../../components/ui/EmptyState";
import StatusBadge from "./StatusBadge";

const CoursesTable = ({
    courses,
    formatValue,
    formatDate
}) => (
    <section className="tableCard">
        <div className="tableCardHeader">
            <div>
                <h2>Courses</h2>

                <p>
                    {courses.length} enrolled course
                    {courses.length === 1 ? "" : "s"}
                </p>
            </div>
        </div>

        {courses.length ? (
            <div className="responsiveTableWrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Category</th>
                            <th>Level</th>
                            <th>Duration</th>
                            <th>Progress</th>
                            <th>Status</th>
                            <th>Certificate</th>
                            <th>Started</th>
                            <th>Completed</th>
                        </tr>
                    </thead>

                    <tbody>
                        {courses.map((item) => (
                            <tr key={item._id}>
                                <td data-label="Course">
                                    {formatValue(
                                        item.course?.title
                                    )}
                                </td>

                                <td data-label="Category">
                                    {formatValue(
                                        item.course?.category
                                    )}
                                </td>

                                <td data-label="Level">
                                    {formatValue(
                                        item.course?.level
                                    )}
                                </td>

                                <td data-label="Duration">
                                    {formatValue(
                                        item.course?.duration
                                    )}
                                </td>

                                <td data-label="Progress">
                                    <div className="progressCell">
                                        <div className="progressTrack">
                                            <span
                                                style={{
                                                    width: `${Math.min(
                                                        Math.max(
                                                            Number(item.progress) || 0,
                                                            0
                                                        ),
                                                        100
                                                    )}%`
                                                }}
                                            />
                                        </div>

                                        <strong>
                                            {Number(item.progress) || 0}%
                                        </strong>
                                    </div>
                                </td>

                                <td data-label="Status">
                                    <StatusBadge
                                        value={item.status}
                                        type={
                                            item.status === "Completed"
                                                ? "success"
                                                : "default"
                                        }
                                    />
                                </td>

                                <td data-label="Certificate">
                                    <StatusBadge
                                        value={
                                            item.certificateIssued
                                                ? "Issued"
                                                : "Not issued"
                                        }
                                        type={
                                            item.certificateIssued
                                                ? "success"
                                                : "default"
                                        }
                                    />
                                </td>

                                <td data-label="Started">
                                    {formatDate(item.startedAt)}
                                </td>

                                <td data-label="Completed">
                                    {formatDate(item.completedAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <EmptyState
                heading="No Courses"
                paragraph="This student has not enrolled in any courses yet."
            />
        )}
    </section>
);

export default CoursesTable;
