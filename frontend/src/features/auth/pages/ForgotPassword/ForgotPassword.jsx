import "./ForgotPassword.css";

import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthLayout from "../../../../layouts/AuthLayout";

import Input from "../../../../components/ui/Input";
import AuthButton from "../../../../components/ui/Button/AuthButton";

import { forgotPasswordSchema } from "../../../../validations/auth/forgotPasswordSchema";

import { forgotPassword } from "../../../../services/api/authService";
import Hash from "../../../../features/dashboard/common/LoaderPage/Hash";

function ForgotPassword() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [serverError, setServerError] = useState("");

    const {

        register,
        handleSubmit,
        formState: { errors }

    } = useForm({

        resolver: zodResolver(forgotPasswordSchema)

    });

    const onSubmit = async (data) => {

        try {

            setLoading(true);

            setServerError("");

            await forgotPassword(data);

            navigate("/verify-reset-otp", {

                state: {

                    email: data.email

                }

            });

        }

        catch (error) {

            setServerError(

                error.response?.data?.message ||

                "Something went wrong"

            );

        }

        finally {

            setLoading(false);

        }

    }



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

                <motion.form

                    className="forgot-form"

                    onSubmit={handleSubmit(onSubmit)}

                >

                    <Input

                        label="Email"

                        type="email"

                        placeholder="Enter registered email"

                        icon={<FaEnvelope />}

                        {...register("email")}

                        error={errors.email?.message}

                    />

                    {

                        serverError &&

                        <p className="forgot-error">

                            {serverError}

                        </p>

                    }

                    <AuthButton
                        type="submit"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? "Sending OTP..." : "Send OTP"}
                    </AuthButton>

                    <p className="login-back">

                        Remember password?

                        <Link to="/login">

                            Login

                        </Link>

                    </p>

                </motion.form>

            </AuthLayout>

        </>
    )

}

export default ForgotPassword;