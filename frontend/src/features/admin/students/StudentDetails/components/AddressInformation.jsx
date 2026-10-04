import SectionCard from "./SectionCard";
import DetailRow from "./DetailRow";

const AddressInformation = ({ student }) => (
    <SectionCard title="Address">
        <div className="detailRows">
            <DetailRow
                label="Current Address"
                value={student.currentAddress}
            />

            <DetailRow
                label="Local Address"
                value={student.localAddress}
            />

            <DetailRow
                label="District"
                value={student.district}
            />

            <DetailRow
                label="State"
                value={student.state}
            />

            <DetailRow
                label="Pincode"
                value={student.pincode}
            />
        </div>
    </SectionCard>
);

export default AddressInformation;
