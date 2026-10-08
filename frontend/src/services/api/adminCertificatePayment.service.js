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
// GET ISSUED CERTIFICATES BY STUDENT
// ==========================================

export const getIssuedCertificates = async () => {

    const { data } = await api.get(
        API.ADMIN.CERTIFICATE_PAYMENTS.ISSUED
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
// DOWNLOAD ISSUED CERTIFICATE
// ==========================================

export const downloadIssuedCertificate = async (id) => {

    return api.get(
        API.ADMIN.CERTIFICATE_PAYMENTS.DOWNLOAD(id),
        {
            responseType: "blob",
        }
    );

};


// ==========================================
// APPROVE CERTIFICATE PAYMENT
// ==========================================

export const approveCertificatePayment = async (id, certificateImage) => {

    const formData = new FormData();
    formData.append("certificateImage", certificateImage);

    const { data } = await api.patch(
        API.ADMIN.CERTIFICATE_PAYMENTS.APPROVE(id),
        formData,
        {
            headers: {
                "Content-Type": undefined,
            },
        }
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
