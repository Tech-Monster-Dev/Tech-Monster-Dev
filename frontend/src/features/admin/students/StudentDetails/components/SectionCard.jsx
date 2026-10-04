const SectionCard = ({ title, children, className = "" }) => (
    <section className={`detailCard ${className}`}>
        <div className="detailCardHeader">
            <h2>{title}</h2>
        </div>

        {children}
    </section>
);

export default SectionCard;