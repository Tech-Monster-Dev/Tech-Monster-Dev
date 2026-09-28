import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

import Form from "../../../../../../components/ui/Form";
import DashButton from "../../../../../../components/ui/Button/DashButton";

import {
    validateField,
    validateForm,
} from "../../../../../../shared/utils/validation/formValidation";

const paidFormRules = {
    payerName: {
        required: true,
        requiredMessage: "Full name is required",
    },
    transactionId: {
        required: true,
        requiredMessage: "Transaction ID is required",
    },
};

export default function PaidFormModal({
    open,
    onClose,
    onSubmit,
    submitting = false,
}) {
    const [formData, setFormData] = useState({
        payerName: "",
        transactionId: "",
    });

    const [errors, setErrors] = useState({});

    const fields = [
        {
            name: "payerName",
            label: "Full Name",
            type: "text",
            placeholder: "Enter the name used for payment",
            required: true,
        },
        {
            name: "transactionId",
            label: "Transaction ID",
            type: "text",
            placeholder: "Enter your UPI transaction/reference ID",
            required: true,
        },
    ];

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        setErrors((current) => ({
            ...current,
            [name]: validateField(name, value, paidFormRules),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const { errors: newErrors, isValid } = validateForm(
            formData,
            paidFormRules
        );

        setErrors(newErrors);

        if (!isValid) return;

        const submitted = await onSubmit(formData);

        if (submitted) {
            setFormData({
                payerName: "",
                transactionId: "",
            });
            setErrors({});
        }
    };

    if (!open) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                className="certificate-payment-modal-overlay certificate-paid-form-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="certificate-payment-modal certificate-paid-form-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                    <div className="certificate-payment-modal-header">
                        <h3>Payment Details</h3>

                        <button
                            type="button"
                            className="certificate-modal-close"
                            onClick={onClose}
                            disabled={submitting}
                            aria-label="Close payment details"
                        >
                            ×
                        </button>
                    </div>

                    <p className="certificate-payment-instruction">
                        Enter the details of the UPI payment you have completed.
                    </p>

                    <Form
                        fields={fields}
                        values={formData}
                        errors={errors}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        formClassName="certificate-paid-form"
                        disabled={submitting}
                        noValidate
                        actions={[
                            {
                                label: submitting ? "Submitting..." : "Submit Payment Details",
                                type: "submit",
                                component: DashButton,
                                variant: "primary",
                                fullWidth: true,
                                loading: submitting,
                            },
                        ]}
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}