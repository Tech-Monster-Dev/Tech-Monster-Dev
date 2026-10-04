const DetailRow = ({ label, value }) => (
    <div className="detailRow">
        <span className="studentDetailsLabel">{label}</span>
        <span className="studentDetailsValue">
            {value === null || value === undefined || value === ""
                ? "Not provided"
                : String(value)}
        </span>
    </div>
);

export default DetailRow;
