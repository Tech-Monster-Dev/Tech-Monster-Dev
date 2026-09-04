import useSkeletonScrollLock from "../../../../../shared/hooks/useSkeletonScrollLock";

import { useEffect, useState } from "react";

import { toast } from "react-toastify";

import {
    getCertificatePaymentDetails,
    approveCertificatePayment,
    rejectCertificatePayment,
} from "../../../../../services/api/adminCertificatePayment.service";

import "./CertificatePaymentDetails.css";


export default function CertificatePaymentDetails({
    paymentId,
    onClose,
    onActionComplete,
}) {

    const [payment, setPayment] = useState(null);

    const [loading, setLoading] = useState(true);

    useSkeletonScrollLock(loading);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [rejecting, setRejecting] =
        useState(false);

    const [rejectionReason, setRejectionReason] =
        useState("");


    useEffect(() => {
        if (!paymentId) return;

        const loadDetails = async () => {
            setLoading(true);

            try {
                const response = await getCertificatePaymentDetails(paymentId);
                setPayment(response?.payment || null);
            } catch (err) {
                console.error("Failed to load certificate payment:", err);
                toast.error(
                    err?.response?.data?.message ||
                    "Unable to load payment details."
                );
                onClose?.();
            } finally {
                setLoading(false);
            }
        }
        
        loadDetails();
    }, [paymentId, onClose]);


    const handleApprove = async () => {

        if (!paymentId) return;

        const confirmed =
            window.confirm(
                "Approve this payment and issue the certificate?"
            );

        if (!confirmed) return;

        setActionLoading(true);

        try {

            await approveCertificatePayment(
                paymentId
            );

            toast.success(
                "Payment approved and certificate issued successfully."
            );

            onActionComplete?.();

            onClose?.();

        } catch (err) {

            console.error(
                "Certificate payment approval failed:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                "Failed to approve certificate payment."
            );

        } finally {

            setActionLoading(false);

        }

    };


    const handleReject = async (event) => {

        event.preventDefault();

        const reason =
            rejectionReason.trim();

        if (!reason) {

            toast.error(
                "Please provide a rejection reason."
            );

            return;

        }

        setActionLoading(true);

        try {

            await rejectCertificatePayment(
                paymentId,
                reason
            );

            toast.success(
                "Certificate payment rejected successfully."
            );

            onActionComplete?.();

            onClose?.();

        } catch (err) {

            console.error(
                "Certificate payment rejection failed:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                "Failed to reject certificate payment."
            );

        } finally {

            setActionLoading(false);

        }

    };


    if (!paymentId) {
        return null;
    }


    return (
        <div
            className="certificate-payment-details-overlay"
            onMouseDown={(event) => {

                if (
                    event.target === event.currentTarget &&
                    !actionLoading
                ) {
                    onClose?.();
                }

            }}
        >

            <div
                className="certificate-payment-details-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="certificate-payment-details-title"
            >

                <div className="certificate-payment-details-header">

                    <div>

                        <h2 id="certificate-payment-details-title">
                            Certificate Payment Review
                        </h2>

                        <p>
                            Verify the payment before issuing
                            the certificate.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="certificate-payment-close-btn"
                        onClick={onClose}
                        disabled={actionLoading}
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>


                {loading ? (

                    <div className="certificate-payment-details-loading">

                        <div />
                        <div />
                        <div />
                        <div />

                    </div>

                ) : !payment ? (

                    <div className="certificate-payment-details-empty">

                        <h3>
                            Payment Not Found
                        </h3>

                        <p>
                            This certificate payment could not
                            be loaded.
                        </p>

                    </div>

                ) : (

                    <>

                        <div className="certificate-payment-status">

                            <span>
                                Payment Status
                            </span>

                            <strong>
                                {payment.status || "—"}
                            </strong>

                        </div>


                        <div className="certificate-payment-details-grid">

                            <div className="certificate-payment-detail-section">

                                <h3>
                                    Student
                                </h3>

                                <div className="certificate-payment-detail-row">

                                    <span>
                                        Name
                                    </span>

                                    <strong>
                                        {`${payment.student?.firstName || ""} ${payment.student?.lastName || ""}`
                                            .trim() ||
                                            payment.student?.username ||
                                            "—"}
                                    </strong>

                                </div>

                                <div className="certificate-payment-detail-row">

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {payment.student?.email || "—"}
                                    </strong>

                                </div>

                            </div>


                            <div className="certificate-payment-detail-section">

                                <h3>
                                    Program
                                </h3>

                                <div className="certificate-payment-detail-row">

                                    <span>
                                        Type
                                    </span>

                                    <strong>
                                        {payment.programType || "—"}
                                    </strong>

                                </div>

                                <div className="certificate-payment-detail-row">

                                    <span>
                                        Program
                                    </span>

                                    <strong>
                                        {payment.programTitle ||
                                            payment.course?.title ||
                                            payment.internship?.title ||
                                            "—"}
                                    </strong>

                                </div>

                            </div>


                            <div className="certificate-payment-detail-section">

                                <h3>
                                    Payment
                                </h3>

                                <div className="certificate-payment-detail-row">

                                    <span>
                                        Certificate Fee
                                    </span>

                                    <strong>
                                        {payment.currency || "INR"}{" "}
                                        {Number(
                                            payment.amount || 0
                                        ).toLocaleString("en-IN")}
                                    </strong>

                                </div>

                                <div className="certificate-payment-detail-row">

                                    <span>
                                        Paid At
                                    </span>

                                    <strong>
                                        {payment.paidAt
                                            ? new Date(
                                                payment.paidAt
                                            ).toLocaleString("en-IN")
                                            : "—"}
                                    </strong>

                                </div>

                            </div>


                            <div className="certificate-payment-detail-section">

                                <h3>
                                    Gateway Details
                                </h3>

                                <div className="certificate-payment-detail-row">

                                    <span>
                                        Order ID
                                    </span>

                                    <strong>
                                        {payment.gatewayOrderId || "—"}
                                    </strong>

                                </div>

                                <div className="certificate-payment-detail-row">

                                    <span>
                                        Payment ID
                                    </span>

                                    <strong>
                                        {payment.gatewayPaymentId || "—"}
                                    </strong>

                                </div>

                                <div className="certificate-payment-detail-row">

                                    <span>
                                        Transaction ID
                                    </span>

                                    <strong>
                                        {payment.transactionId || "—"}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {!rejecting ? (

                            <div className="certificate-payment-details-actions">

                                <button
                                    type="button"
                                    className="certificate-payment-reject-btn"
                                    onClick={() =>
                                        setRejecting(true)
                                    }
                                    disabled={actionLoading}
                                >
                                    Reject Payment
                                </button>

                                <button
                                    type="button"
                                    className="certificate-payment-approve-btn"
                                    onClick={handleApprove}
                                    disabled={
                                        actionLoading ||
                                        payment.status !==
                                        "approval_pending"
                                    }
                                >
                                    {actionLoading
                                        ? "Processing..."
                                        : "Approve & Issue Certificate"}
                                </button>

                            </div>

                        ) : (

                            <form
                                className="certificate-payment-rejection-form"
                                onSubmit={handleReject}
                            >

                                <h3>
                                    Reject Certificate Payment
                                </h3>

                                <p>
                                    Provide a clear reason. The
                                    student will be notified.
                                </p>

                                <textarea
                                    value={rejectionReason}
                                    onChange={(event) =>
                                        setRejectionReason(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter rejection reason..."
                                    rows={5}
                                    maxLength={1000}
                                    disabled={actionLoading}
                                    required
                                />

                                <div className="certificate-payment-details-actions">

                                    <button
                                        type="button"
                                        className="certificate-payment-cancel-btn"
                                        onClick={() => {

                                            setRejecting(
                                                false
                                            );

                                            setRejectionReason("");

                                        }}
                                        disabled={actionLoading}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="certificate-payment-reject-confirm-btn"
                                        disabled={
                                            actionLoading ||
                                            !rejectionReason.trim()
                                        }
                                    >
                                        {actionLoading
                                            ? "Rejecting..."
                                            : "Confirm Rejection"}
                                    </button>

                                </div>

                            </form>

                        )}

                    </>

                )}

            </div>

        </div>
    );

}
