import "./ResetPassword.css";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import AuthLayout from "../../../../layouts/AuthLayout";

import Form from "../../../../components/ui/Form";
import PasswordStrength from "../../../../components/ui/Form/component/PasswordStrength";
import AuthButton from "../../../../components/ui/Button/AuthButton";
import Hash from "../../../../features/dashboard/common/LoaderPage/Hash";

import { resetPassword } from "../../../../services/api/authService";
import { validateField, validateForm } from "../../../../shared/utils/validation/formValidation.js";

const resetPasswordRules = {
    password: {
        required: true,
        minLength: 8,
        minLengthMessage: "Password must be at least 8 characters",
        pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/,
        patternMessage: "At least one uppercase letter, one lowercase letter, one number and one special character",
    },

    confirmPassword: {
        required: true,
        requiredMessage: "Password confirmation is required",
    },
}

function ResetPassword() {

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password", {
                replace: true
            });
        }
    }, [email, navigate]);

    const fields = [
        {
            name: "password",
            label: "Password",
            type: "password",
            required: true,
        },
        {
            name: "confirmPassword",
            label: "Confirm Password",
            type: "password",
            required: true,
        },
    ]

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        const updatedFormData = {
            ...formData,
            [name]: value
        };

        setFormData(updatedFormData);

        const fieldError = validateField(
            name,
            value,
            resetPasswordRules
        );

        setErrors((prev) => ({
            ...prev,
            [name]: fieldError,
            ...(name === "confirmPassword" &&
                value !== updatedFormData.password && {
                confirmPassword: "Passwords do not match"
            }),
            ...(name === "password" &&
                updatedFormData.confirmPassword &&
                value !== updatedFormData.confirmPassword && {
                confirmPassword: "Passwords do not match"
            })
        }));
    };

    const handleUpdatePassword = async (event) => {
        event.preventDefault();

        const {
            errors: newErrors,
            isValid: formIsValid
        } = validateForm(
            formData,
            resetPasswordRules
        );

        const validationErrors = {
            ...newErrors,
        };

        if (formData.password !== formData.confirmPassword) {
            validationErrors.confirmPassword = "Passwords do not match";
        }

        const isValid =
            formIsValid &&
            formData.password === formData.confirmPassword;

        setErrors(validationErrors);

        if (!isValid) {
            return;
        }

        setLoading(true);

        try {
            await resetPassword({
                email,
                newPassword: formData.password,
                confirmPassword: formData.confirmPassword
            });

            navigate("/login", {
                replace: true,
                state: {
                    success: "Password changed successfully."
                }
            });

            toast.success("Password changed successfully.");

        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                "Something went wrong";

            toast.error(message);

        } finally {
            setLoading(false);
        }
    };

    const actions = [
        {
            label: "Update Password",
            type: "submit",
            component: AuthButton,
            fullWidth: true,
            disabled: loading,
        },
    ];

    return (
        <>
            {
                loading && (
                    <Hash
                        fullScreen
                        message="Updating your password..."
                        size={70}
                    />
                )
            }
            <AuthLayout
                title="Reset Password"
                subtitle="Create a strong password."
            >

                <Form
                    fields={fields}
                    values={formData}
                    onChange={handleInputChange}
                    onSubmit={handleUpdatePassword}
                    errors={errors}
                    formClassName="reset-form"
                    actions={actions}
                >
                    <PasswordStrength password={formData.password} />
                </Form>
            </AuthLayout>
        </>
    );
}

export default ResetPassword;