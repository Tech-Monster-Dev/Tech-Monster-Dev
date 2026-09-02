import { useEffect, useMemo, useState } from "react";

import {
    createCertificatePayment,
    verifyCertificateQRPayment,
    getMyCertificatePayment,
    cancelCertificatePayment,
} from "../../../../../../services/api/certificatePayment.service";

const PAYMENT_POLL_MS = 5000;
const APPROVAL_POLL_MS = 10000;

export default function useCertificatePayment({ programId, programType }) {
    const [payment, setPayment] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creatingPayment, setCreatingPayment] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const normalizedProgramType = programType === "course" ? "course" : "internship";

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
                    const loadedQrCode = data?.qrCode || null;

                    setPayment(loadedPayment);

                    if (
                        loadedPayment &&
                        ["created", "pending"].includes(loadedPayment.status) &&
                        loadedQrCode?.imageUrl
                    ) {
                        setQrCode(loadedQrCode);
                        setIsModalOpen(true);
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
            setQrCode(data?.qrCode || null);

            if (data?.qrCode?.imageUrl && nextPayment) {
                setIsModalOpen(true);
            }

            return true;
        } catch (error) {
            console.error("Certificate payment creation failed:", error);
            return false;
        } finally {
            setCreatingPayment(false);
        }
    };

    const handleCancelPayment = async () => {
        if (!payment?.id) return false;

        if (!['created', 'pending'].includes(payment.status)) {
            return false;
        }

        try {
            setCancelling(true);
            await cancelCertificatePayment({ paymentId: payment.id });

            setIsModalOpen(false);
            setQrCode(null);
            setPayment(null);

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
                Math.ceil((new Date(payment.expiresAt).getTime() - Date.now()) / 1000)
            );

            setTimeLeft(remaining);

            if (remaining <= 0) {
                setIsModalOpen(false);
                setQrCode(null);
                setPayment((current) =>
                    current ? { ...current, status: "expired" } : current
                );
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [isModalOpen, payment?.expiresAt]);

    useEffect(() => {
        if (!isModalOpen || !payment?.id) return;

        const checkPayment = async () => {
            try {
                const { data } = await verifyCertificateQRPayment({
                    paymentId: payment.id,
                });

                if (data?.paid) {
                    setPayment(data.payment);
                    setQrCode(null);
                    setIsModalOpen(false);
                }
            } catch (error) {
                if (error.response?.status === 410) {
                    setIsModalOpen(false);
                    setQrCode(null);
                    setPayment((current) =>
                        current ? { ...current, status: "expired" } : current
                    );
                }
            }
        };

        const poll = setInterval(checkPayment, PAYMENT_POLL_MS);
        checkPayment();

        return () => clearInterval(poll);
    }, [isModalOpen, payment?.id]);

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
        cancelling,
        isModalOpen,
        timeLeft,
        programParams,
        handleCreatePayment,
        handleCancelPayment,
    };
}
