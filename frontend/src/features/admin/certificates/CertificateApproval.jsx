import { useState } from "react";

import PendingCertificatePayments from "./components/PendingCertificatePayments";
import CertificatePaymentDetails from "./components/CertificatePaymentDetails";

import "./CertificateApproval.css";


export default function CertificateApproval() {

    const [refresh, setRefresh] = useState(0);

    const [selectedPaymentId, setSelectedPaymentId] =
        useState(null);


    const handleSelectPayment = (paymentId) => {

        setSelectedPaymentId(paymentId);

    };


    return (
        <div className="certificate-approval-page">

            <div className="certificate-approval-header">

                <div>

                    <h1>
                        Certificate Approval
                    </h1>

                    <p>
                        Review verified certificate payments
                        and approve certificate issuance.
                    </p>

                </div>

            </div>


            <PendingCertificatePayments
                refresh={refresh}
                onSelectPayment={handleSelectPayment}
            />

            {selectedPaymentId && (
                <CertificatePaymentDetails
                    paymentId={selectedPaymentId}
                    onClose={() => setSelectedPaymentId(null)}
                    onActionComplete={() => {
                        setSelectedPaymentId(null);
                        setRefresh((prev) => prev + 1);
                    }}
                />
            )}

        </div>
    );

}
