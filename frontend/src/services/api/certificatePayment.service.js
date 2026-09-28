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


export const submitCertificatePayment = ({
    paymentId,
    payerName,
    transactionId,
}) => {

    return api.post(
        API.CERTIFICATE_PAYMENTS.SUBMIT,
        {
            paymentId,
            payerName,
            transactionId,
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
