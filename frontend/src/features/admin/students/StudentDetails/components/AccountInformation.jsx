import SectionCard from "./SectionCard";
import DetailRow from "./DetailRow";

const AccountInformation = ({
    student,
    formatDateTime
}) => (
    <SectionCard title="Account Information">
        <div className="detailRows">
            <DetailRow
                label="Username"
                value={student.username}
            />

            <DetailRow
                label="Role"
                value={student.role}
            />

            <DetailRow
                label="Email Verified"
                value={
                    student.isVerified
                        ? "Yes"
                        : "No"
                }
            />

            <DetailRow
                label="Terms Accepted"
                value={
                    student.termsAccepted
                        ? "Yes"
                        : "No"
                }
            />

            <DetailRow
                label="Profile Completed"
                value={
                    student.profileCompleted
                        ? "Yes"
                        : "No"
                }
            />

            <DetailRow
                label="Account Status"
                value={
                    student.isBlocked
                        ? "Blocked"
                        : "Active"
                }
            />

            <DetailRow
                label="Created"
                value={formatDateTime(student.createdAt)}
            />

            <DetailRow
                label="Updated"
                value={formatDateTime(student.updatedAt)}
            />
        </div>
    </SectionCard>
);

export default AccountInformation;
