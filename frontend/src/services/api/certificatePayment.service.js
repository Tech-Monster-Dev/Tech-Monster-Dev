import api from "./axios";
import { API } from "./endpoints";


export const createCertificatePayment = ({
    courseId = null,
    internshipId = null,
}) => {

    return api.post(
        API.CERTIFICATE_PAYMENTS.CREATE,
        {
            courseId,
            internshipId,
        }
    );
};


export const verifyCertificatePayment = ({
    paymentId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}) => {

    return api.post(
        API.CERTIFICATE_PAYMENTS.VERIFY,
        {
            paymentId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        }
    );
};


export const verifyCertificateQRPayment = ({
    paymentId,
}) => {

    return api.post(
        API.CERTIFICATE_PAYMENTS.VERIFY_QR,
        {
            paymentId,
        }
    );
};


export const cancelCertificatePayment = ({
    paymentId,
}) => {

    return api.post(
        API.CERTIFICATE_PAYMENTS.CANCEL,
        {
            paymentId,
        }
    );
};


export const getMyCertificatePayment = ({
    courseId = null,
    internshipId = null,
}) => {

    const params = courseId
        ? { courseId }
        : { internshipId };

    return api.get(
        API.CERTIFICATE_PAYMENTS.MY,
        {
            params,
        }
    );
};
