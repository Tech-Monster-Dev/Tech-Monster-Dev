const StatusBadge = ({ value, type = "default" }) => (
    <span className={`statusBadge statusBadge-${type}`}>
        {value === null || value === undefined || value === ""
            ? "Not provided"
            : String(value)}
    </span>
);

export default StatusBadge;
