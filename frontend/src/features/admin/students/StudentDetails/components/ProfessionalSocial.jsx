import SectionCard from "./SectionCard";

const ProfessionalSocial = ({ student }) => (
    <SectionCard title="Professional & Social">
        <div className="studentDetailsLongField">
            <span className="studentDetailsLabel">
                Skills
            </span>

            <div className="skillList">
                {student.skills?.length ? (
                    student.skills.map((skill) => (
                        <span
                            className="skillBadge"
                            key={skill}
                        >
                            {skill}
                        </span>
                    ))
                ) : (
                    <span className="studentDetailsValue">
                        Not provided
                    </span>
                )}
            </div>
        </div>

        <div className="socialLinks">
            {student.github ? (
                <a
                    href={student.github}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </a>
            ) : (
                <span className="studentDetailsValue">
                    GitHub not provided
                </span>
            )}

            {student.linkedin ? (
                <a
                    href={student.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    LinkedIn
                </a>
            ) : (
                <span className="studentDetailsValue">
                    LinkedIn not provided
                </span>
            )}
        </div>
    </SectionCard>
);

export default ProfessionalSocial;
