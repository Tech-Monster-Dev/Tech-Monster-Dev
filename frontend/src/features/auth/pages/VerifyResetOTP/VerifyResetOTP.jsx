import "../../styles/VerifyOTP.css";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

import AuthLayout from "../../../../layouts/AuthLayout";

import Form from '../../../../components/ui/Form';
import AuthButton from "../../../../components/ui/Button/AuthButton";
import Hash from "../../../../features/dashboard/common/LoaderPage/Hash";


import { verifyOtp, resendOtp } from "../../../../services/api/authService";
import { validateForm, validateField } from "../../../../shared/utils/validation/formValidation";

const otpRules = {
    otp: {
        required: true,
        minLength: 6,
        minLengthMessage: "Please enter valid OTP",
        pattern: /^[0-9]+$/,
        patternMessage: "OTP must contain numbers only",
    },
}

function VerifyResetOTP() {

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [errors, setErrors] = useState({});
    const [timer, setTimer] = useState(() => {
        const expiresAt = localStorage.getItem("resetOtpExpiresAt");

        if (!expiresAt) {
            return 0;
        }

        return Math.max(
            Math.ceil(
                (Number(expiresAt) - Date.now()) / 1000
            ),
            0
        );
    });

    useEffect(() => {
        const updateTimer = () => {
            const expiresAt = localStorage.getItem("resetOtpExpiresAt");

            if (!expiresAt) {
                setTimer(0);
                return;
            }

            const remaining = Math.max(
                Math.ceil(
                    (Number(expiresAt) - Date.now()) / 1000
                ),
                0
            );

            setTimer(remaining);

            if (remaining <= 0) {
                localStorage.removeItem("resetOtpExpiresAt");
            }
        };

        updateTimer();

        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, []);

    const fields = [
        {
            name: "otp",
            label: "OTP",
            type: "otp",
            length: 6,
            required: true,
        },
    ]



    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timer <= 0) {
            localStorage.removeItem("resetOtpExpiresAt");
            return;
        }

        const interval = setInterval(() => {
            const expiresAt = Number(
                localStorage.getItem("resetOtpExpiresAt")
            );

            const remaining = Math.ceil(
                (expiresAt - Date.now()) / 1000
            );

            if (remaining <= 0) {
                setTimer(0);
                localStorage.removeItem("resetOtpExpiresAt");
            } else {
                setTimer(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (e) => {
        setOtp(e.target.value);

        setErrors(
            validateForm(
                {
                    otp: e.target.value
                },
                {
                    otp: validateField("otp", e.target.value, "otp")
                }
            )
        );
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const {
            errors: newErrors,
            isValid
        } = validateForm({ otp }, otpRules)

        setErrors(newErrors);
        if (!isValid) return;

        if (otp.length !== 6) {
            return (
                toast.error("Please enter valid OTP")
            );
        }
        try {
            setLoading(true);
            await verifyOtp({
                email,
                otp,
                purpose: "forgot-password"
            });

            navigate("/reset-password", {
                state: {
                    email
                }
            });
        }
        catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        }
        finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResending(true);
            await resendOtp({
                email,
                purpose: "forgot-password"
            });
            const expiresAt = Date.now() + 60 * 1000;

            localStorage.setItem(
                "resetOtpExpiresAt",
                expiresAt.toString()
            );

            setTimer(60);

            toast.success("OTP sent to your email");
        }
        catch (err) {
            console.log(err);
            toast.error(err.response?.data?.message || "Something went wrong");
        }
        finally {
            setResending(false);
        }
    };

    const actions = [
        {
            label: "Verify OTP",
            type: "submit",
            component: AuthButton,
            fullWidth: true,
            disabled: loading
        }
    ];

    return (
        <>
            {
                loading && (
                    <Hash
                        fullScreen
                        message="Verifying OTP..."
                        size={70}
                    />
                )
            }

            <AuthLayout
                title="Verify OTP"
                subtitle="Verify OTP to reset password"
            >
                <Form
                    fields={fields}
                    values={{ otp }}
                    errors={errors}
                    onChange={handleChange}
                    onSubmit={handleVerify}
                    formClassName="verify-container"
                    actions={actions}
                >
                    {timer > 0 ?
                        <p>Resend OTP in {timer}s</p>
                        :
                        <AuthButton
                            type="button"
                            onClick={handleResend}
                            disabled={resending}
                        >
                            {
                                resending ? "Sending..." : "Resend OTP"
                            }
                        </AuthButton>
                    }
                </Form>
            </AuthLayout>
        </>
    );
}

export default VerifyResetOTP;