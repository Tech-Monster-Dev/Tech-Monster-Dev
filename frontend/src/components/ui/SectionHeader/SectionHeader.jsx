import "./SectionHeader.css";

function SectionHeader({
    badge,
    title,
    description
}) {

    return (

        <div className="section-header">

            <span>{badge}</span>

            {title && <h2>{title}</h2>}

            {description && <p>{description}</p>}

        </div>

    )

}

export default SectionHeader;