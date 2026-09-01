import Razorpay from "razorpay";

const keyId = String(
    process.env.RAZORPAY_KEY_ID || ""
).trim();

const keySecret = String(
    process.env.RAZORPAY_KEY_SECRET || ""
).trim();


/*
 * ==========================================
 * RAZORPAY CLIENT
 * ==========================================
 *
 * Credentials MUST come from environment
 * variables.
 *
 * NEVER hardcode live Razorpay credentials.
 */
const razorpay =
    keyId && keySecret
        ? new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        })
        : null;


/*
 * ==========================================
 * CONFIGURATION
 * ==========================================
 */

export const isRazorpayConfigured = () =>
    Boolean(razorpay);


export const getRazorpayKeyId = () =>
    keyId;


/*
 * ==========================================
 * CREATE RAZORPAY ORDER
 * ==========================================
 *
 * Amount supplied here is INR.
 *
 * Razorpay requires amount in paise.
 */
export const createRazorpayOrder =
    async ({
        amount,
        currency = "INR",
        receipt,
        notes = {},
    }) => {

        if (!razorpay) {
            throw new Error(
                "Razorpay is not configured."
            );
        }


        const normalizedAmount =
            Number(amount);


        if (
            !Number.isFinite(
                normalizedAmount
            ) ||
            normalizedAmount <= 0
        ) {
            throw new Error(
                "Invalid payment amount."
            );
        }


        return razorpay.orders.create({

            amount:
                Math.round(
                    normalizedAmount * 100
                ),

            currency,

            receipt,

            notes,

        });
    };


/*
 * ==========================================
 * FETCH RAZORPAY PAYMENT
 * ==========================================
 */
export const fetchRazorpayPayment =
    async (
        paymentId
    ) => {

        if (!razorpay) {
            throw new Error(
                "Razorpay is not configured."
            );
        }


        if (!paymentId) {
            throw new Error(
                "Razorpay payment ID is required."
            );
        }


        return razorpay.payments.fetch(
            paymentId
        );
    };


/*
 * ==========================================
 * FETCH RAZORPAY QR PAYMENTS
 * ==========================================
 *
 * Returns payments collected through a
 * specific Razorpay Dynamic QR.
 */
export const fetchRazorpayQRPayments =
    async (
        qrCodeId,
        params = {}
    ) => {

        if (!razorpay) {
            throw new Error(
                "Razorpay is not configured."
            );
        }

        if (!qrCodeId) {
            throw new Error(
                "Razorpay QR code ID is required."
            );
        }

        return razorpay.qrCode.fetchAllPayments(
            qrCodeId,
            params
        );
    };


/*
 * ==========================================
 * CREATE RAZORPAY QR CODE
 * ==========================================
 *
 * This creates a gateway-side dynamic QR
 * instead of a fake/static image.
 *
 * The QR is tied to the exact Razorpay
 * order/payment amount.
 *
 * The QR response contains the image URL
 * that the frontend can display.
 */
export const createRazorpayQRCode =
    async ({
        amount,
        description,
        customerName,
        customerEmail,
        customerContact,
        closeBy,
        notes = {},
    }) => {

        if (!razorpay) {
            throw new Error(
                "Razorpay is not configured."
            );
        }


        const normalizedAmount =
            Number(amount);


        if (
            !Number.isFinite(
                normalizedAmount
            ) ||
            normalizedAmount <= 0
        ) {
            throw new Error(
                "Invalid QR payment amount."
            );
        }


        const qrAmount =
            Math.round(
                normalizedAmount * 100
            );


        const qrPayload = {

            type:
                "upi_qr",

            name:
                "Tech Monster Pvt. Ltd.",

            usage:
                "single_use",

            fixed_amount:
                true,

            payment_amount:
                qrAmount,

            description:
                description ||
                "Tech Monster Certificate Payment",

            close_by:
                closeBy,

            notes,

        };


        if (customerName) {
            qrPayload.customer_id =
                String(customerName);
        }


        /*
         * Razorpay's QR API does not use the
         * student's frontend-provided amount.
         *
         * The amount passed here has already
         * been resolved from the database.
         */
        return razorpay.qrCode.create(
            qrPayload
        );
    };


export default razorpay;
