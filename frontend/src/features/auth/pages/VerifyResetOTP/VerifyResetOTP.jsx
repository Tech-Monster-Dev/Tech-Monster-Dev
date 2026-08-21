import "../../styles/VerifyOTP.css";

import {
    useEffect,
    useState
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";


import AuthLayout from "../../../../layouts/AuthLayout";

import OTPInput from "../../../../components/ui/OTPInput";

import AuthButton from "../../../../components/ui/Button/AuthButton";


import {
    verifyOtp,
    resendOtp
} from "../../../../services/api/authService";
import Hash from "../../../../features/dashboard/common/LoaderPage/Hash";





function VerifyResetOTP() {



    const navigate = useNavigate();

    const location = useLocation();



    const email = location.state?.email;



    const [otp, setOtp] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const [timer, setTimer] = useState(60);






    useEffect(() => {


        if (!email) {

            navigate("/forgot-password");

        }


    }, [email, navigate]);





    useEffect(() => {


        if (timer === 0) return;


        const id = setInterval(() => {


            setTimer(
                prev => prev - 1
            );


        }, 1000);



        return () => clearInterval(id);


    }, [timer]);







    const handleVerify = async () => {


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


        await resendOtp({

            email,

            purpose: "forgot-password"

        });


        setTimer(60);


    };







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

                            >

                                Resend OTP

                            </button>

                    }



                </div>


            </AuthLayout>


        </>
    );


}


export default VerifyResetOTP;