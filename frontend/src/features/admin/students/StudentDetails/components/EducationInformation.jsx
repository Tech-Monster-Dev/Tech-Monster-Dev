import SectionCard from "./SectionCard";
import DetailRow from "./DetailRow";

const EducationInformation = ({ student }) => (
    <SectionCard title="Education">
        <div className="detailRows">
            <DetailRow
                label="Education"
                value={student.education}
            />

            <DetailRow
                label="College"
                value={student.college}
            />

            <DetailRow
                label="Branch"
                value={student.branch}
            />

            <DetailRow
                label="Year"
                value={student.year}
            />

            <DetailRow
                label="Semester"
                value={student.semester}
            />
        </div>
    </SectionCard>
);

export default EducationInformation;
