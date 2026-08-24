import "./ResetPassword.css";

import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import {
    useForm,
    useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthLayout from "../../../../layouts/AuthLayout";

import PasswordInput from "../../../../components/ui/PasswordInput";
import AuthButton from "../../../../components/ui/Button/AuthButton";
import PasswordStrength from "../../../../components/ui/PasswordStrength";

import { resetPasswordSchema } from "../../../../validations/auth/resetPasswordSchema";
import { resetPassword } from "../../../../services/api/authService";
import Hash from "../../../../features/dashboard/common/LoaderPage/Hash";

function ResetPassword() {

    const navigate = useNavigate();

    const location = useLocation();

    const email = location.state?.email;

    const [serverError, setServerError] = useState("");

    const [loading, setLoading] = useState(false);

    const {

        register,

        handleSubmit,

        control,

        formState: {

            errors

        }

    } = useForm({

        resolver: zodResolver(resetPasswordSchema)

    });

    const password =
        useWatch({
            control,
            name: "password"
        });

    const onSubmit = async (data) => {

        try {

            setLoading(true);

            setServerError("");

            await resetPassword({

                email,

                newPassword: data.password,

                confirmPassword: data.confirmPassword

            });

            navigate("/login", {

                replace: true,

                state: {

                    success:

                        "Password changed successfully."

                }

            });

        }

        catch (error) {

            setServerError(

                error.response?.data?.message ||

                "Unable to reset password."

            );

        }

        finally {

            setLoading(false);

        }

    };

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

                <motion.form

                    className="reset-form"

                    onSubmit={handleSubmit(onSubmit)}

                    initial={{

                        opacity: 0,

                        y: 20

                    }}

                    animate={{

                        opacity: 1,

                        y: 0

                    }}

                >

                    <PasswordInput

                        label="New Password"

                        placeholder="Enter new password"

                        showStrength

                        {...register("password")}

                        error={errors.password?.message}

                    />

                    <PasswordInput

                        label="Confirm Password"

                        placeholder="Confirm password"

                        {...register("confirmPassword")}

                        error={errors.confirmPassword?.message}

                    />

                    <PasswordStrength password={password} />

                    {

                        serverError &&

                        <p className="reset-error">

                            {serverError}

                        </p>

                    }

                    <AuthButton
                        fullWidth
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update Password"}

                    </AuthButton>

                </motion.form>

            </AuthLayout>

        </>
    );

}

export default ResetPassword;
