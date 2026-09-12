import { motion } from "framer-motion";
import Textinput from "../../../../../../components/ui/Form/component/Textinput";
import { ProfileImageInput } from "./index";

function PersonalDetails({
    formData,
    errors,
    preview,
    handleChange,
    handleImageChange
}) {
    return (
        <>
            <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                id="form-section-title"
            >
                1. Personal Details
            </motion.h3>

            <div id="form-grid">

                <ProfileImageInput
                    formData={formData?.av}
                    preview={preview}
                    onChange={handleImageChange}
                />

                <Textinput
                    label="First Name"
                    type="text"
                    placeholder="Enter First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    required
                />

                <Textinput
                    label="Middle Name"
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                />

                <Textinput
                    label="Last Name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    required
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    id="form-group"
                >
                    <label>Email (Auto-filled) *</label>

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        readOnly
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    id="form-group"
                >

                    <select
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select Gender
                        </option>

                        <option value="male">
                            Male
                        </option>

                        <option value="female">
                            Female
                        </option>

                        <option value="other">
                            Other
                        </option>
                    </select>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    id="form-group"
                >
                    <label>Phone Number *</label>

                    <div id="whatsapp-row">
                        <input
                            type="tel"
                            name="phone"
                            required
                            placeholder="10-digit number"
                            value={formData.phone}
                            onChange={handleChange}
                        />

                        <a
                            href="https://wa.me/918984457601?text=Hello%20Tech%20Monster"
                            target="_blank"
                            rel="noreferrer"
                            id="whatsapp-link"
                        >
                            Join WhatsApp
                        </a>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    id="form-group"
                >
                    <label>Date of Birth</label>

                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                    />
                </motion.div>

            </div>
        </>
    );
}

export default PersonalDetails;