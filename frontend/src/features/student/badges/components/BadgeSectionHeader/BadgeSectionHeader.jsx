export default function BadgeSectionHeader({
    icon,
    title,
    count
}) {
    return (
        <div className="badge-section-heading">
            <div>
                <span className="section-icon">
                    {icon}
                </span>

                <div>
                    <h2>{title}</h2>

                    <p>
                        {count} achievements
                    </p>
                </div>
            </div>
        </div>
    );
}
