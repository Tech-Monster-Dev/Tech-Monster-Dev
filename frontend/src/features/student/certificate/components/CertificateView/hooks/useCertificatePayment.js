import { useEffect, useMemo, useState } from "react";

import QRImage from "../../../../../../assets/thumnail/QR.svg";

import {
    createCertificatePayment,
    submitCertificatePayment,
    getMyCertificatePayment,
    cancelCertificatePayment,
} from "../../../../../../services/api/certificatePayment.service";

const APPROVAL_POLL_MS = 10000;
const PAID_FORM_STORAGE_KEY = "certificatePaidFormPaymentId";

export default function useCertificatePayment({ programId, programType }) {
    const [payment, setPayment] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creatingPayment, setCreatingPayment] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaidFormOpen, setIsPaidFormOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const normalizedProgramType =
        programType === "course" ? "course" : "internship";

    const programParams = useMemo(() => {
        if (!programId) return null;

        return normalizedProgramType === "course"
            ? { courseId: programId }
            : { internshipId: programId };
    }, [programId, normalizedProgramType]);

    useEffect(() => {
        let mounted = true;

        const loadPayment = async () => {
            if (!programParams) {
                if (mounted) setLoading(false);
                return;
            }

            try {
                const { data } = await getMyCertificatePayment(programParams);

                if (mounted) {
                    const loadedPayment = data?.payment || null;

                    setPayment(loadedPayment);

                    if (
                        loadedPayment &&
                        ["created", "pending"].includes(loadedPayment.status)
                    ) {
                        setQrCode({ imageUrl: QRImage });
                        setIsModalOpen(true);

                        if (
                            sessionStorage.getItem(PAID_FORM_STORAGE_KEY) ===
                            loadedPayment.id
                        ) {
                            setIsPaidFormOpen(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load certificate payment:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadPayment();

        return () => {
            mounted = false;
        };
    }, [programParams]);

    const handleCreatePayment = async () => {
        if (!programParams) return false;

        try {
            setCreatingPayment(true);

            const { data } = await createCertificatePayment(programParams);
            const nextPayment = data?.payment || null;

            setPayment(nextPayment);

            if (nextPayment) {
                setQrCode({ imageUrl: QRImage });
                setIsModalOpen(true);
                setIsPaidFormOpen(false);
                sessionStorage.removeItem(PAID_FORM_STORAGE_KEY);
            }

            return true;
        } catch (error) {
            console.error("Certificate payment creation failed:", error);
            return false;
        } finally {
            setCreatingPayment(false);
        }
    };

    const handleOpenPaidForm = () => {
        if (!payment?.id) return false;

        if (!["created", "pending"].includes(payment.status)) {
            return false;
        }

        setIsPaidFormOpen(true);
        sessionStorage.setItem(PAID_FORM_STORAGE_KEY, payment.id);

        return true;
    };

    const handleClosePaidForm = () => {
        setIsPaidFormOpen(false);
        sessionStorage.removeItem(PAID_FORM_STORAGE_KEY);
    };

    const handleSubmitPayment = async ({ payerName, transactionId }) => {
        if (!payment?.id) return false;

        if (!["created", "pending"].includes(payment.status)) {
            return false;
        }

        try {
            setSubmitting(true);

            const { data } = await submitCertificatePayment({
                paymentId: payment.id,
                payerName,
                transactionId,
            });

            const submittedPayment = data?.payment || null;

            if (submittedPayment) {
                setPayment(submittedPayment);
            }

            setIsPaidFormOpen(false);
            setIsModalOpen(false);
            setQrCode(null);
            sessionStorage.removeItem(PAID_FORM_STORAGE_KEY);

            return true;
        } catch (error) {
            console.error("Certificate payment submission failed:", error);
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelPayment = async () => {
        if (!payment?.id) return false;

        if (!["created", "pending"].includes(payment.status)) {
            return false;
        }

        try {
            setCancelling(true);

            await cancelCertificatePayment({ paymentId: payment.id });

            setIsPaidFormOpen(false);
            setIsModalOpen(false);
            setQrCode(null);
            setPayment(null);
            sessionStorage.removeItem(PAID_FORM_STORAGE_KEY);

            return true;
        } catch (error) {
            console.error("Certificate payment cancellation failed:", error);
            return false;
        } finally {
            setCancelling(false);
        }
    };

    useEffect(() => {
        if (!isModalOpen || !payment?.expiresAt) return;

        const updateTimer = () => {
            const remaining = Math.max(
                0,
                Math.ceil(
                    (new Date(payment.expiresAt).getTime() - Date.now()) / 1000
                )
            );

            setTimeLeft(remaining);

            if (remaining <= 0) {
                setIsPaidFormOpen(false);
                setIsModalOpen(false);
                setQrCode(null);
                setPayment((current) =>
                    current ? { ...current, status: "expired" } : current
                );
                sessionStorage.removeItem(PAID_FORM_STORAGE_KEY);
            }
        };

        updateTimer();

        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [isModalOpen, payment?.expiresAt]);

    useEffect(() => {
        if (!payment?.id) return;

        const isWaitingForApproval =
            payment.status === "paid" ||
            payment.status === "approval_pending";

        if (!isWaitingForApproval) return;

        const checkApproval = async () => {
            try {
                const { data } = await getMyCertificatePayment(programParams);
                const latestPayment = data?.payment;

                if (latestPayment) {
                    setPayment(latestPayment);
                }
            } catch (error) {
                console.error("Failed to check certificate approval:", error);
            }
        };

        const poll = setInterval(checkApproval, APPROVAL_POLL_MS);

        checkApproval();

        return () => clearInterval(poll);
    }, [payment?.id, payment?.status, programParams]);

    return {
        payment,
        qrCode,
        loading,
        creatingPayment,
        submitting,
        cancelling,
        isModalOpen,
        isPaidFormOpen,
        timeLeft,
        programParams,
        handleCreatePayment,
        handleOpenPaidForm,
        handleClosePaidForm,
        handleSubmitPayment,
        handleCancelPayment,
    };
}
