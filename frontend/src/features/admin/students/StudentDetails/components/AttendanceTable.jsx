import EmptyState from "../../../../../components/ui/EmptyState";
import StatusBadge from "./StatusBadge";

const formatActiveTime = (seconds) => {
    const totalSeconds = Math.max(Number(seconds) || 0, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
        return hours + "h " + String(minutes).padStart(2, "0") + "m " + String(remainingSeconds).padStart(2, "0") + "s";
    }

    if (minutes > 0) {
        return minutes + "m " + String(remainingSeconds).padStart(2, "0") + "s";
    }

    return remainingSeconds + "s";
};

const AttendanceTable = ({
    attendance,
    formatDate,
    getProgramName,
    getProgramType
}) => (
    <section className="tableCard">
        <div className="tableCardHeader">
            <div>
                <h2>Attendance</h2>

                <p>
                    {attendance.length} attendance record
                    {attendance.length === 1 ? "" : "s"}
                </p>
            </div>
        </div>

        {attendance.length ? (
            <div className="responsiveTableWrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Program</th>
                            <th>Type</th>
                            <th>Active Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {attendance.map((item) => (
                            <tr key={item._id}>
                                <td data-label="Date">
                                    {formatDate(item.createdAt)}
                                </td>

                                <td data-label="Program">
                                    {getProgramName(item)}
                                </td>

                                <td data-label="Type">
                                    {getProgramType(item)}
                                </td>

                                <td data-label="Active Time">
                                    {formatActiveTime(item.activeSeconds)}
                                </td>

                                <td data-label="Status">
                                    <StatusBadge
                                        value={item.status}
                                        type={
                                            item.status === "Present"
                                                ? "success"
                                                : item.status === "Absent"
                                                    ? "danger"
                                                    : "default"
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <EmptyState
                heading="No Attendance Records"
                paragraph="No attendance records are available for this student."
            />
        )}
    </section>
);

export default AttendanceTable;
