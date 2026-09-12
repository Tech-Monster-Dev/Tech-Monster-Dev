import { motion } from "framer-motion";
import Textinput from "../../../../../../components/ui/Form/component/Textinput";

function AddressDetails({
    formData,
    errors,
    handleChange
}) {
    return (
        <>
            <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
                id="form-section-title"
            >
                3. Address Details
            </motion.h3>

            <div id="form-grid">

                <Textinput
                    label="Current Address"
                    type="text"
                    placeholder="Enter current address"
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleChange}
                    error={errors.currentAddress}
                    required
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.4 }}
                    id="form-group"
                >
                    <label>Local Address *</label>

                    <input
                        type="text"
                        name="localAddress"
                        required
                        value={formData.localAddress}
                        onChange={handleChange}
                    />
                </motion.div>

                <Textinput
                    label="Pincode"
                    type="text"
                    placeholder="Enter 6 digit pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    error={errors.pincode}
                    maxLength={6}
                    required
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.8 }}
                    id="form-group"
                >
                    <label>District (Auto-filled) *</label>

                    <input
                        type="text"
                        name="district"
                        value={formData.district}
                        readOnly
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3 }}
                    id="form-group"
                >
                    <label>State (Auto-filled) *</label>

                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        readOnly
                    />
                </motion.div>

            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.2 }}
                id="form-group"
            >
                <label>Bio</label>

                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                />
            </motion.div>
        </>
    );
}

export default AddressDetails;