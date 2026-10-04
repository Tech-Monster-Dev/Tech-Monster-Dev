import EmptyState from "../../../../../components/ui/EmptyState";
import StatusBadge from "./StatusBadge";

const InternshipsTable = ({
    internships,
    formatValue,
    formatDate
}) => (
    <section className="tableCard">
        <div className="tableCardHeader">
            <div>
                <h2>Internships</h2>

                <p>
                    {internships.length} enrolled internship
                    {internships.length === 1 ? "" : "s"}
                </p>
            </div>
        </div>

        {internships.length ? (
            <div className="responsiveTableWrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Internship</th>
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
                        {internships.map((item) => (
                            <tr key={item._id}>
                                <td data-label="Internship">
                                    {formatValue(
                                        item.internship?.title
                                    )}
                                </td>

                                <td data-label="Category">
                                    {formatValue(
                                        item.internship?.category
                                    )}
                                </td>

                                <td data-label="Level">
                                    {formatValue(
                                        item.internship?.level
                                    )}
                                </td>

                                <td data-label="Duration">
                                    {formatValue(
                                        item.internship?.duration
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
                heading="No Internships"
                paragraph="This student has not enrolled in any internships yet."
            />
        )}
    </section>
);

export default InternshipsTable;
