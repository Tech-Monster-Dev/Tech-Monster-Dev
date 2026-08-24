import "./AdminLogin.css";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {toast} from "react-toastify";

import useAuth from "../../../../shared/hooks/useAuth";

import AuthLayout from "../../../../layouts/AuthLayout";

import Input from "../../../../components/ui/Input";
import PasswordInput from "../../../../components/ui/PasswordInput";
import AuthButton from "../../../../components/ui/Button/AuthButton";

import { adminLogin } from "../../../../services/api/authService";
import Hash from "../../../../features/dashboard/common/LoaderPage/Hash";

function AdminLogin() {
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const [error, setError] = useState("");

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({

        defaultValues: {
            email: "",
            password: "",
        }

    });

    const onSubmit = async (data) => {

        setError("");
        setLoading(true);

        try {

            const response = await adminLogin(data);

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

            setError(
                err.response?.data?.message ||
                "Admin Login Failed"
            );

            toast.error(err.response?.data?.message);

        } finally {
            setLoading(false);
        }

    };

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

                <motion.form onSubmit={handleSubmit(onSubmit)} className="admin-login-form">

                    <Input
                        label="Admin Email"
                        type="email"
                        placeholder="admin@gmail.com"
                        // eslint-disable-next-line react-hooks/incompatible-library
                        value={watch("email")}
                        {...register("email", {
                            required: "Email is required",
                        })}
                        error={errors.email?.message}
                    />

                    <PasswordInput
                        label="Password"
                        value={watch("password")}
                        {...register("password", {
                            required: "Password is required",
                        })}
                        error={errors.password?.message}
                    />

                    {error && (
                        <p className="admin-error">
                            {error}
                        </p>
                    )}

                    <AuthButton
                        type="submit"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login as Admin"}
                    </AuthButton>

                    <p id="user-login-link">
                        User login !
                        <Link to="/login">
                            Login
                        </Link>
                    </p>

                </motion.form>

            </AuthLayout>

        </>
    );

}

export default AdminLogin;