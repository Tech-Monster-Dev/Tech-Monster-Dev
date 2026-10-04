import SectionCard from "./SectionCard";
import DetailRow from "./DetailRow";

const PersonalInformation = ({
    student,
    formatDate,
    formatValue
}) => (
    <SectionCard title="Personal Information">
        <div className="detailRows">
            <DetailRow
                label="First Name"
                value={student.firstName}
            />

            <DetailRow
                label="Middle Name"
                value={student.middleName}
            />

            <DetailRow
                label="Last Name"
                value={student.lastName}
            />

            <DetailRow
                label="Gender"
                value={student.gender}
            />

            <DetailRow
                label="Date of Birth"
                value={formatDate(student.dateOfBirth)}
            />

            <DetailRow
                label="Phone"
                value={student.phone}
            />
        </div>

        <div className="studentDetailsLongField">
            <span className="studentDetailsLabel">
                Bio
            </span>

            <p>
                {formatValue(student.bio)}
            </p>
        </div>
    </SectionCard>
);

export default PersonalInformation;
