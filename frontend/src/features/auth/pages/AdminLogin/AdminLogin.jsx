import "./AdminLogin.css";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { toast } from "react-toastify";

import useAuth from "../../../../shared/hooks/useAuth";

import AuthLayout from "../../../../layouts/AuthLayout";

import Form from '../../../../components/ui/Form';
import AuthButton from "../../../../components/ui/Button/AuthButton";
import Hash from "../../../../features/dashboard/common/LoaderPage/Hash";

import { adminLogin } from "../../../../services/api/authService";
import { fields, loginRules } from "../Login/loginData";
import { validateField, validateForm } from "../../../../shared/utils/validation/formValidation";

function AdminLogin() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, value, loginRules)
        }));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        const {
            errors: newErrors,
            isValid
        } = validateForm(formData, loginRules)
        setErrors(newErrors);
        if (!isValid) return;


        try {
            setLoading(true);
            const response = await adminLogin(formData);

            const {
                accessToken,
                user
            } = response.data;

            login({
                token: accessToken,
                user
            });

            navigate("/admin");

        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const actions = [
        {
            label: "Admin Login",
            type: "submit",
            component: AuthButton,
            fullwidth: true,
            disabled: loading
        }
    ]

    return (

        <>
            {
                loading && (
                    <Hash
                        fullScreen
                        message="Authenticating admin..."
                        size={70}
                    />
                )
            }

            <AuthLayout
                title="Admin Login"
                subtitle="Tech Monster Admin Panel"
            >
                <Form
                    fields={fields}
                    values={formData}
                    errors={errors}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    formClassName="admin-login-form"
                    actions={actions}
                >
                    <p className="user-login-link">
                        User login !
                        <Link to="/login">
                            Login
                        </Link>
                    </p>
                </Form>

            </AuthLayout>
        </>
    );
}

export default AdminLogin;