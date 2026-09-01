import api from "./axios";
import { API } from "./endpoints";


// ==========================================
// GET PENDING CERTIFICATE PAYMENTS
// ==========================================

export const getPendingCertificatePayments = async () => {

    const { data } = await api.get(
        API.ADMIN.CERTIFICATE_PAYMENTS.PENDING
    );

    return data;

};


// ==========================================
// GET CERTIFICATE PAYMENT DETAILS
// ==========================================

export const getCertificatePaymentDetails = async (id) => {

    const { data } = await api.get(
        API.ADMIN.CERTIFICATE_PAYMENTS.DETAILS(id)
    );

    return data;

};


// ==========================================
// APPROVE CERTIFICATE PAYMENT
// ==========================================

export const approveCertificatePayment = async (id) => {

    const { data } = await api.patch(
        API.ADMIN.CERTIFICATE_PAYMENTS.APPROVE(id)
    );

    return data;

};


// ==========================================
// REJECT CERTIFICATE PAYMENT
// ==========================================

export const rejectCertificatePayment = async (
    id,
    rejectionReason
) => {

    const { data } = await api.patch(

        API.ADMIN.CERTIFICATE_PAYMENTS.REJECT(id),

        {
            rejectionReason
        }

    );

    return data;

};
