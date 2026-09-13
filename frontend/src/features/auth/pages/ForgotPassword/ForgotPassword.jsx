import "./ForgotPassword.css";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

import AuthLayout from "../../../../layouts/AuthLayout";

import Form from "../../../../components/ui/Form/Form";
import AuthButton from "../../../../components/ui/Button/AuthButton";
import Hash from "../../../../features/dashboard/common/LoaderPage/Hash";


import { forgotPassword } from "../../../../services/api/authService";
import { validateField, validateForm } from "../../../../shared/utils/validation/formValidation.js";


const forgotPasswordRules = {
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: "Please enter a valid email",
    },
}

function ForgotPassword() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
    });
    const [errors, setErrors] = useState({});

    const fields = [
        {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "Enter your email",
            required: true,
        },
    ]

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, value, forgotPasswordRules)
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const {
            errors: newErrors,
            isValid
        } = validateForm(formData, forgotPasswordRules);

        setErrors(newErrors);
        if (!isValid) return;

        try {
            setLoading(true);
            await forgotPassword(formData);
            navigate("/verify-reset-otp", {
                state: {
                    email: formData.email
                }
            });

            toast.success("OTP sent to your email");
        }

        catch (error) {
            toast.error(error.response.data.message || "Something went wrong");
        }
        finally {
            setLoading(false);
        }
    }

    const actions = [
        {
            label: "Send OTP",
            type: "submit",
            component: AuthButton,
            fullWidth: true,
            disabled: loading
        }
    ]



    return (
        <>
            {
                loading && (
                    <Hash
                        fullScreen
                        message="Sending OTP to your email..."
                        size={70}
                    />
                )
            }

            <AuthLayout
                title="Forgot Password"
                subtitle="Enter your registered email."
            >

                <Form
                    fields={fields}
                    values={formData}
                    errors={errors}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    formClassName="forgot-form"
                    actions={actions}
                >
                    <p className="login-back">
                        Remember password?
                        <Link to="/login">
                            Login
                        </Link>
                    </p>

                </Form>

            </AuthLayout>

        </>
    )

}

export default ForgotPassword;