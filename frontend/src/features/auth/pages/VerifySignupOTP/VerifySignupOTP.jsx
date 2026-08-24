import "../../styles/VerifyOTP.css";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import useAuth from "../../../../shared/hooks/useAuth";

import AuthLayout from "../../../../layouts/AuthLayout";

import OTPInput from "../../../../components/ui/OTPInput";
import AuthButton from "../../../../components/ui/Button/AuthButton";
import Hash from '../../../../features/dashboard/common/LoaderPage/Hash';

import {verifyOtp, resendOtp} from "../../../../services/api/authService";



function VerifySignupOTP() {

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const email = location.state?.email;
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(60);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {


        if (!email) {

            navigate("/signup");

        }


    }, [email, navigate]);





    useEffect(() => {


        if (timer === 0) return;


        const interval = setInterval(() => {


            setTimer(
                prev => prev - 1
            );


        }, 1000);



        return () => clearInterval(interval);


    }, [timer]);


    const handleVerify = async () => {


        if (otp.length !== 6) {

            return setError(
                "Please enter valid OTP"
            );

        }


        try {


            setLoading(true);

            setError("");
            const response = await verifyOtp({

                email,

                otp,

                purpose: "signup"

            });

            login({
                token: response.data.accessToken,
                user: response.data.user
            });


            const role = response.data.user.role;

            switch (role) {

                case "student":

                    navigate("/student", {

                        replace: true

                    });

                    break;

                case "admin":

                    navigate("/admin", {

                        replace: true

                    });

                    break;

                default:

                    navigate("/login");

            }



        }

        catch (err) {


            setError(

                err.response?.data?.message ||

                "Invalid OTP"

            );


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

                purpose: "signup"

            });



            setTimer(60);



        }


        catch (err) {


            console.log(err);


        }


        finally {


            setResending(false);


        }



    };





    return (

        <>

            {
                loading && (
                    <Hash
                        fullScreen
                        message="Verifying your account..."
                        size={70}
                    />
                )
            }



            <AuthLayout

                title="Verify Account"

                subtitle="Enter OTP sent to your email"

            >



                <div className="verify-container">


                    <OTPInput

                        length={6}

                        value={otp}

                        onChange={setOtp}

                    />



                    {
                        error &&

                        <p className="otp-error">

                            {error}

                        </p>
                    }

                    <AuthButton
                        fullWidth
                        onClick={handleVerify}
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </AuthButton>




                    {


                        timer > 0

                            ?

                            <p>

                                Resend OTP in {timer}s


                            </p>


                            :

                            <button

                                onClick={handleResend}

                                disabled={resending}

                            >

                                {
                                    resending

                                        ?

                                        "Sending..."

                                        :

                                        "Resend OTP"
                                }


                            </button>


                    }



                </div>


            </AuthLayout>


        </>
    );


}


export default VerifySignupOTP;