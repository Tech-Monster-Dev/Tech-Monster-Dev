import { motion } from "framer-motion";
import EmptyState from "../../../../../../components/ui/EmptyState";

export default function SkillsSection({
    skills
}) {

    return (
        <motion.div
            id="skills-profile-box"

            initial={{
                opacity: 0,
                y: 15
            }}

            animate={{
                opacity: 1,
                y: 0
            }}
        >

            <label>
                Skills
            </label>


            <div id="skills-tags">

                {skills?.length > 0 ? (

                    skills.map(
                        (skill, index) => (

                            <span
                                className="skill-tag"
                                key={`${skill}-${index}`}
                            >
                                {skill}
                            </span>

                        )
                    )

                ) : (

                    <EmptyState
                        compact
                        heading="No Skills Added"
                        paragraph="No skills have been added to this profile yet."
                    />

                )}

            </div>

        </motion.div>
    );
}