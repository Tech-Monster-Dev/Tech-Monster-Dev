import { motion } from "framer-motion";

import {
    FaPencilAlt,
    FaCheck,
    FaTimes
} from "react-icons/fa";


export default function EditableField({
    field,
    label,
    value,
    type = "text",
    multiline = false,
    readOnly = false,

    editingField,
    tempValue,
    setTempValue,

    handleEditClick,
    handleCancel,
    handleSave,

    saving
}) {

    const isEditing =
        editingField === field;


    return (
        <motion.div
            className="profile-field-box"

            initial={{
                opacity: 0,
                y: 15
            }}

            animate={{
                opacity: 1,
                y: 0
            }}
        >

            <div className="profile-field-content">

                <label>
                    {label}
                </label>


                {isEditing ? (

                    multiline ? (

                        <textarea
                            value={tempValue}

                            onChange={(e) =>
                                setTempValue(
                                    e.target.value
                                )
                            }

                            autoFocus
                        />

                    ) : (

                        <input
                            type={type}

                            value={tempValue}

                            onChange={(e) =>
                                setTempValue(
                                    e.target.value
                                )
                            }

                            autoFocus
                        />

                    )

                ) : (

                    <span>
                        {value || "Not provided"}
                    </span>

                )}

            </div>


            {!readOnly && (

                <div className="profile-field-actions">

                    {isEditing ? (

                        <>

                            <button
                                type="button"
                                className="field-save-btn"
                                disabled={saving}
                                onClick={() =>
                                    handleSave(field)
                                }
                            >
                                <FaCheck />
                            </button>


                            <button
                                type="button"
                                className="field-cancel-btn"
                                disabled={saving}
                                onClick={handleCancel}
                            >
                                <FaTimes />
                            </button>

                        </>

                    ) : (

                        <button
                            type="button"
                            className="pencil-btn"

                            onClick={() =>
                                handleEditClick(
                                    field,
                                    value
                                )
                            }
                        >
                            <FaPencilAlt />
                        </button>

                    )}

                </div>

            )}

        </motion.div>
    );
}