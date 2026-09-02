import { useEffect, useState } from "react";

import {
    getPendingCertificatePayments,
} from "../../../../../services/api/adminCertificatePayment.service";

import EmptyState from "../../../../../components/ui/EmptyState/EmptyState";

import "./PendingCertificatePayments.css";


export default function PendingCertificatePayments({
    refresh = 0,
    onSelectPayment,
}) {

    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        fetchPayments();

    }, [refresh]);


    const fetchPayments = async () => {

        setLoading(true);

        setError("");

        try {

            const response =
                await getPendingCertificatePayments();

            setPayments(
                response?.payments || []
            );

        } catch (err) {

            console.error(
                "Failed to load certificate payments:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load certificate payments."
            );

        } finally {

            setLoading(false);

        }

    };


    if (loading) {

        return (
            <div className="certificate-payments-loading">

                <div className="certificate-payment-loading-card" />
                <div className="certificate-payment-loading-card" />
                <div className="certificate-payment-loading-card" />

            </div>
        );

    }


    if (error) {

        return (
            <div className="certificate-payments-error">

                <h3>
                    Unable to load payments
                </h3>

                <p>
                    {error}
                </p>

                <button
                    type="button"
                    onClick={fetchPayments}
                >
                    Try Again
                </button>

            </div>
        );

    }


    if (payments.length === 0) {

        return (
            <EmptyState
                heading="No Pending Certificate Payments"
                paragraph="Verified certificate payments waiting for admin approval will appear here."
            />
        );

    }


    return (
        <section className="pending-certificate-payments">

            <div className="certificate-payments-header">

                <div>

                    <h2>
                        Pending Certificate Payments
                    </h2>

                    <p>
                        {payments.length} payment
                        {payments.length !== 1 ? "s" : ""}
                        {" "}awaiting review
                    </p>

                </div>

            </div>


            <div className="certificate-payment-list">

                {payments.map((payment) => {

                    const student =
                        payment.student || {};

                    const programTitle =
                        payment.programTitle ||
                        payment.course?.title ||
                        payment.internship?.title ||
                        "Certificate";

                    const studentName =
                        `${student.firstName || ""} ${student.lastName || ""}`
                            .trim() ||
                        student.username ||
                        "Student";


                    return (
                        <article
                            className="certificate-payment-card"
                            key={payment._id}
                        >

                            <div className="certificate-payment-card-main">

                                <div className="certificate-payment-student">

                                    <h3>
                                        {studentName}
                                    </h3>

                                    <p>
                                        {student.email || "No email available"}
                                    </p>

                                </div>


                                <div className="certificate-payment-program">

                                    <span>
                                        {payment.programType}
                                    </span>

                                    <strong>
                                        {programTitle}
                                    </strong>

                                </div>


                                <div className="certificate-payment-amount">

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


                                <div className="certificate-payment-date">

                                    <span>
                                        Paid
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


                            <button
                                type="button"
                                className="certificate-payment-review-btn"
                                onClick={() =>
                                    onSelectPayment?.(payment._id)
                                }
                            >
                                Review Payment
                            </button>

                        </article>
                    );

                })}

            </div>

        </section>
    );

}
