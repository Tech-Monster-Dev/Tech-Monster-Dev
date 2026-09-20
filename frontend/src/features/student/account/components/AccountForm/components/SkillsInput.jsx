import { motion } from "framer-motion";

function SkillsInput({
    skills,
    skillInput,
    setSkillInput,
    addSkill,
    removeSkill,
    error,
    disabled = false
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="account-form-group"
        >
            <label
                className="account-form-label"
                htmlFor="skill-input"
            >
                Add Skills (Maximum 7)
                <span className={skills.length > 0 || skillInput.trim() ? "labelSpanGreen" : "labelSpanRed"}>*</span>
            </label>

            <div className="skills-input-container">
                <input
                    id="skill-input"
                    type="text"
                    value={skillInput}
                    placeholder="Add skill & click add"
                    onChange={(e) =>
                        setSkillInput(e.target.value)
                    }
                    disabled={disabled}
                />

                <button
                    type="button"
                    className="add-skill-btn"
                    onClick={addSkill}
                    disabled={disabled}
                >
                    Add
                </button>
            </div>

            {error && (
                <small className="form-error">
                    {error}
                </small>
            )}

            <div className="skills-tags">
                {skills.map((skill, index) => (
                    <span
                        key={`${skill}-${index}`}
                        className="skill-tag"
                    >
                        {skill}

                        <button
                            type="button"
                            className="skill-tag-remove"
                            onClick={() => removeSkill(index)}
                            disabled={disabled}
                            aria-label={`Remove ${skill}`}
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
        </motion.div>
    );
}

export default SkillsInput;
