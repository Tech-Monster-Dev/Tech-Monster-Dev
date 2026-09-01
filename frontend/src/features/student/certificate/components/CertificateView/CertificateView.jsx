import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import { toast } from "react-toastify";

import {
    createCertificatePayment,
    verifyCertificateQRPayment,
    getMyCertificatePayment,
} from "../../../../../services/api/certificatePayment.service";

import "./CertificateView.css";


export default function CertificateView({
    courseType,
    userName,
    programId,
    programType,
}) {

    const [payment, setPayment] = useState(null);

    const [qrCode, setQrCode] = useState(null);

    const [loading, setLoading] = useState(true);

    const [creatingPayment, setCreatingPayment] =
        useState(false);

    const [verifyingPayment, setVerifyingPayment] =
        useState(false);


    const normalizedProgramType =
        programType === "course"
            ? "course"
            : "internship";


    const programParams = useMemo(() => {

        if (!programId) {
            return null;
        }

        return normalizedProgramType === "course"
            ? { courseId: programId }
            : { internshipId: programId };

    }, [
        programId,
        normalizedProgramType,
    ]);


    useEffect(() => {

        let mounted = true;


        const loadPayment = async () => {

            if (!programParams) {

                if (mounted) {
                    setLoading(false);
                }

                return;
            }


            try {

                const { data } =
                    await getMyCertificatePayment(
                        programParams
                    );


                if (!mounted) {
                    return;
                }


                setPayment(
                    data?.payment || null
                );

            } catch (error) {

                console.error(
                    "Failed to load certificate payment:",
                    error
                );

                if (mounted) {

                    toast.error(
                        error.response?.data?.message ||
                        "Failed to load certificate payment status."
                    );

                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }

        };


        loadPayment();


        return () => {
            mounted = false;
        };

    }, [programParams]);


    const handleCreatePayment = async () => {

        if (!programParams) {

            toast.error(
                "Certificate program information is missing."
            );

            return;
        }


        try {

            setCreatingPayment(true);


            const { data } =
                await createCertificatePayment(
                    programParams
                );


            setPayment(
                data?.payment || null
            );


            setQrCode(
                data?.qrCode || null
            );


            if (data?.qrCode?.imageUrl) {

                toast.success(
                    data?.reused
                        ? "Existing certificate payment loaded."
                        : "Certificate payment QR created."
                );

            }

        } catch (error) {

            console.error(
                "Certificate payment creation failed:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to create certificate payment."
            );

        } finally {

            setCreatingPayment(false);

        }

    };


    const handleVerifyPayment = async () => {

        if (!payment?.id) {

            toast.error(
                "Payment information is missing."
            );

            return;
        }


        try {

            setVerifyingPayment(true);


            const { data } =
                await verifyCertificateQRPayment({

                    paymentId:
                        payment.id,

                });


            if (data?.paid) {

                setPayment(
                    data.payment
                );

                setQrCode(null);

                toast.success(
                    "Payment verified. Waiting for admin approval."
                );

            } else {

                toast.info(
                    "Payment has not been captured yet."
                );

            }

        } catch (error) {

            console.error(
                "Certificate payment verification failed:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to verify payment."
            );

        } finally {

            setVerifyingPayment(false);

        }

    };


    const handleRefreshStatus = async () => {

        if (!programParams) {
            return;
        }


        try {

            setLoading(true);


            const { data } =
                await getMyCertificatePayment(
                    programParams
                );


            setPayment(
                data?.payment || null
            );

        } catch (error) {

            console.error(
                "Failed to refresh certificate payment:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to refresh payment status."
            );

        } finally {

            setLoading(false);
        }

    };


    const formatAmount = (amount, currency = "INR") => {

        if (
            amount === undefined ||
            amount === null
        ) {
            return "";
        }


        try {

            return new Intl.NumberFormat(
                "en-IN",
                {
                    style: "currency",
                    currency,
                }
            ).format(amount);

        } catch {

            return `${currency} ${amount}`;

        }

    };


    const status = payment?.status || null;


    const isPaymentPending =
        status === "created" ||
        status === "pending";


    const isApprovalPending =
        status === "paid" ||
        status === "approval_pending";


    const isApproved =
        status === "approved";


    const isRejected =
        status === "rejected";


    const isExpired =
        status === "expired";


    if (loading) {

        return (
            <motion.div
                className="certificate-view-container"
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
            >
                <div className="payment-section">

                    <h4>
                        Loading certificate payment...
                    </h4>

                    <p>
                        Checking your certificate payment status.
                    </p>

                </div>
            </motion.div>
        );

    }


    if (!programId) {

        return (
            <motion.div
                className="certificate-view-container"
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
            >
                <div className="approval-section">

                    <h4>
                        Certificate information unavailable
                    </h4>

                    <p>
                        We could not determine the completed
                        program for this certificate.
                    </p>

                </div>
            </motion.div>
        );

    }


    return (

        <motion.div
            className="certificate-view-container"
            initial={{
                opacity: 0,
                y: 20,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.5,
            }}
        >

            <div className="congrats-banner">

                <h3>
                    Congratulations! 🎉
                </h3>

                <p>
                    You have successfully completed{" "}
                    <strong>
                        {courseType}
                    </strong>
                </p>

            </div>


            {!payment && (

                <div className="payment-section">

                    <h4>
                        Step 1: Complete Certificate Fee Payment
                    </h4>

                    <p>
                        Create your secure certificate payment
                        to receive the Razorpay UPI QR code.
                    </p>


                    <button
                        className="pay-confirm-btn"
                        onClick={handleCreatePayment}
                        disabled={creatingPayment}
                    >
                        {creatingPayment
                            ? "Creating Payment..."
                            : "Pay Certificate Fee"}
                    </button>

                </div>

            )}


            {payment && isPaymentPending && (

                <div className="payment-section">

                    <h4>
                        Step 1: Complete Certificate Fee Payment
                    </h4>

                    <p>
                        Scan the QR code below and complete your
                        certificate payment.
                    </p>


                    {qrCode?.imageUrl ? (

                        <div className="upi-scanner-box">

                            <img
                                src={qrCode.imageUrl}
                                alt="Certificate payment UPI QR code"
                            />

                        </div>

                    ) : (

                        <p>
                            Your payment session is ready.
                            Generate the QR code to continue.
                        </p>

                    )}


                    <div className="payment-amount">

                        {formatAmount(
                            payment.amount,
                            payment.currency
                        )}

                    </div>


                    <button
                        className="pay-confirm-btn"
                        onClick={
                            qrCode?.imageUrl
                                ? handleVerifyPayment
                                : handleCreatePayment
                        }
                        disabled={
                            creatingPayment ||
                            verifyingPayment
                        }
                    >
                        {verifyingPayment
                            ? "Verifying Payment..."
                            : qrCode?.imageUrl
                                ? "I Have Paid — Verify Payment"
                                : "Show Payment QR"}
                    </button>


                    <button
                        type="button"
                        className="certificate-refresh-btn"
                        onClick={handleRefreshStatus}
                        disabled={loading}
                    >
                        Refresh Payment Status
                    </button>

                </div>

            )}


            {isApprovalPending && (

                <div className="approval-section">

                    <h4>
                        Step 2: Admin Verification ⏳
                    </h4>

                    <p>
                        Your payment has been successfully
                        verified. It is now waiting for admin
                        approval.
                    </p>


                    {payment.transactionId && (

                        <p className="payment-meta">
                            Transaction ID:{" "}
                            <strong>
                                {payment.transactionId}
                            </strong>
                        </p>

                    )}


                    <button
                        type="button"
                        className="certificate-refresh-btn"
                        onClick={handleRefreshStatus}
                        disabled={loading}
                    >
                        Check Approval Status
                    </button>

                </div>

            )}


            {isRejected && (

                <div className="approval-section certificate-rejected">

                    <h4>
                        Certificate Payment Rejected
                    </h4>

                    <p>
                        Your payment was reviewed and rejected
                        by the admin.
                    </p>


                    {payment.rejectionReason && (

                        <p className="payment-meta">

                            Reason:{" "}

                            <strong>
                                {payment.rejectionReason}
                            </strong>

                        </p>

                    )}


                    <button
                        type="button"
                        className="pay-confirm-btn"
                        onClick={handleCreatePayment}
                        disabled={creatingPayment}
                    >
                        {creatingPayment
                            ? "Creating Payment..."
                            : "Create New Payment"}
                    </button>

                </div>

            )}


            {isExpired && (

                <div className="approval-section">

                    <h4>
                        Payment Session Expired
                    </h4>

                    <p>
                        Your previous certificate payment
                        session has expired. Create a new payment
                        session to continue.
                    </p>


                    <button
                        type="button"
                        className="pay-confirm-btn"
                        onClick={handleCreatePayment}
                        disabled={creatingPayment}
                    >
                        {creatingPayment
                            ? "Creating Payment..."
                            : "Create New Payment"}
                    </button>

                </div>

            )}


            {isApproved && (

                <div className="certificate-download-section">

                    <div className="certificate-template-preview">

                        <p className="cert-title">
                            Certificate of Completion
                        </p>

                        <p>
                            This is proudly presented to
                        </p>

                        <h2 className="cert-name">
                            {userName}
                        </h2>

                        <p>
                            for successfully completing the
                            rigorous curriculum in{" "}
                            <strong>
                                {courseType}
                            </strong>.
                        </p>

                    </div>


                    <button
                        className="download-btn"
                        onClick={() =>
                            toast.success(
                                "Certificate download will be connected to the issued certificate."
                            )
                        }
                    >
                        Download Certificate (PDF)
                    </button>

                </div>

            )}


            <div className="support-footer">

                Facing any problems? Contact us via{" "}

                <a
                    href="https://wa.me/919999999999"
                    target="_blank"
                    rel="noreferrer"
                >
                    WhatsApp
                </a>{" "}

                or{" "}

                <a href="mailto:support@techmonster.com">
                    Gmail
                </a>.

            </div>

        </motion.div>

    );

}
