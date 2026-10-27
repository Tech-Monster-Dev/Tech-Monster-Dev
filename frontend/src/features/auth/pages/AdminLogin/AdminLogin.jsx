import "./AdminLogin.css";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

    const router = useRouter();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const submitInFlightRef = useRef(false);
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
        if (submitInFlightRef.current) return;

        const {
            errors: newErrors,
            isValid
        } = validateForm(formData, loginRules)
        setErrors(newErrors);
        if (!isValid) return;

        submitInFlightRef.current = true;
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

            router.push("/admin");

        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong";
            toast.error(msg);
        } finally {
            submitInFlightRef.current = false;
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
                        <Link href="/auth/login">
                            Login
                        </Link>
                    </p>
                </Form>

            </AuthLayout>
        </>
    );
}

export default AdminLogin;