import "./CertificatePaymentDetails.css";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
    getCertificatePaymentDetails,
    approveCertificatePayment,
    rejectCertificatePayment,
} from "../../../../../services/api/adminCertificatePayment.service";

import useSkeletonScrollLock from "../../../../../shared/hooks/useSkeletonScrollLock";

export default function CertificatePaymentDetails({
    paymentId,
    onClose,
    onActionComplete,
}) {
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [certificateImage, setCertificateImage] = useState(null);
    const [completionDate, setCompletionDate] = useState(null);
    const [issuedCertificate, setIssuedCertificate] = useState(null);
    
    useSkeletonScrollLock(loading);

    useEffect(() => {
        if (!paymentId) return;

        const loadDetails = async () => {
            setLoading(true);

            try {
                const response = await getCertificatePaymentDetails(paymentId);
                setPayment(response?.payment || null);
                setCompletionDate(response?.completionDate || null);
                setIssuedCertificate(response?.payment?.certificate || null);
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

    const handleCertificateImageChange = (event) => {
        const file = event.target.files?.[0] || null;
        setCertificateImage(file);
    };

    const handleApprove = async () => {
        if (!paymentId) return;

        if (!certificateImage) {
            toast.error("Please upload the certificate image before approval.");
            return;
        }

        const confirmed = window.confirm(
            "Approve this payment and issue the certificate?"
        );
        if (!confirmed) return;
        setActionLoading(true);
        try {
            const response = await approveCertificatePayment(
                paymentId,
                certificateImage
            );
            setIssuedCertificate(response?.certificate || null);
            setPayment(response?.payment || payment);
            toast.success(
                "Payment approved and certificate issued successfully."
            );
            onActionComplete?.();

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
        const reason = rejectionReason.trim();

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
                        Ã—
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
                                {payment.status || "â€”"}
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
                                        {[payment.student?.firstName, payment.student?.middleName, payment.student?.lastName].filter(Boolean).join(" ") || payment.student?.username || "—"}
                                    </strong>
                                </div>

                                <div className="certificate-payment-detail-row">
                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {payment.student?.email || "â€”"}
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
                                        {payment.programType || "â€”"}
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
                                            "â€”"}
                                    </strong>
                                </div>

                                <div className="certificate-payment-detail-row">
                                    <span>
                                        Duration
                                    </span>

                                    <strong>
                                        {payment.course?.duration ||
                                            payment.internship?.duration ||
                                            "â€”"}
                                    </strong>
                                </div>

                                <div className="certificate-payment-detail-row">
                                    <span>
                                        Completion Date
                                    </span>

                                    <strong>
                                        {completionDate
                                            ? new Date(completionDate).toLocaleDateString("en-IN")
                                            : "â€”"}
                                    </strong>
                                </div>

                                <div className="certificate-payment-detail-row">
                                    <span>Certificate ID</span>
                                    <strong>{payment.certificateNumber || "—"}</strong>
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
                                    <span>Paid By</span>
                                    <strong>{payment.payerName || "—"}</strong>
                                </div>

                                <div className="certificate-payment-detail-row">
                                    <span>Transaction ID</span>
                                    <strong>{payment.transactionId || "—"}</strong>
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
                                            : "â€”"}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {payment.verificationToken && (
                            <div className="certificate-payment-issued-section">
                                <h3>{issuedCertificate ? "Certificate Issued" : "Certificate Verification"}</h3>

                                <div className="certificate-payment-detail-row">
                                    <span>Verification URL</span>
                                    <p>
                                        https://tech-monster-dev-lac.vercel.app/verify-certificate/{payment.verificationToken}
                                    </p>
                                </div>
                            </div>
                        )}

                        {!rejecting ? (
                            <>
                            <div className="certificate-payment-certificate-upload">
                                <label htmlFor="certificate-image-upload">
                                    Certificate Image
                                </label>
                                <input
                                    id="certificate-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCertificateImageChange}
                                    disabled={actionLoading}
                                />
                                <small>
                                    Upload the final certificate image. It will be converted to PDF and emailed to the student.
                                </small>
                                {certificateImage && (
                                    <span>
                                        Selected: {certificateImage.name}
                                    </span>
                                )}
                            </div>

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
                            </>

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
                                        {actionLoading ? "Rejecting..." : "Confirm Rejection"}
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