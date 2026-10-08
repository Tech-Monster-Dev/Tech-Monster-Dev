import './CertificateApproval.css';

import { useState } from 'react';

import SectionTabs from '../../../layouts/SectionTabs/SectionTabs.jsx';

import PendingCertificatePayments from './components/PendingCertificatePayments.jsx';
import CertificatePaymentDetails from './components/CertificatePaymentDetails.jsx';
import IssuedCertificates from './components/IssuedCertificates.jsx';
import IssuedCertificatesModal from './components/IssuedCertificatesModal.jsx';

const CERTIFICATE_PAYMENT_MODAL_STORAGE_KEY = 'admin-certificate-payment-modal';
const CERTIFICATE_ISSUED_MODAL_STORAGE_KEY = 'admin-certificate-issued-modal';
const CERTIFICATE_ACTIVE_TAB_STORAGE_KEY = 'admin-certificate-active-tab';
const CERTIFICATE_ISSUED_DETAILS_STORAGE_KEY = 'admin-certificate-issued-details-modal';

const CERTIFICATE_TABS = [
    { value: 'pending', label: 'Pending' },
    { value: 'issued', label: 'Issued' },
];

export default function CertificateApproval() {
    const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem(CERTIFICATE_ACTIVE_TAB_STORAGE_KEY) || 'pending');
    const [refresh, setRefresh] = useState(0);
    const [selectedPaymentId, setSelectedPaymentId] = useState(
        () => sessionStorage.getItem(CERTIFICATE_PAYMENT_MODAL_STORAGE_KEY)
    );
    const [selectedStudent, setSelectedStudent] = useState(() => {
        const storedStudent = sessionStorage.getItem(CERTIFICATE_ISSUED_MODAL_STORAGE_KEY);

        if (!storedStudent) {
            return null;
        }

        try {
            return JSON.parse(storedStudent);
        } catch {
            sessionStorage.removeItem(CERTIFICATE_ISSUED_MODAL_STORAGE_KEY);
            return null;
        }
    });

    const handleSelectPayment = (paymentId) => {
        if (!paymentId) {
            return;
        }

        sessionStorage.setItem(
            CERTIFICATE_PAYMENT_MODAL_STORAGE_KEY,
            paymentId
        );
        setSelectedPaymentId(paymentId);
    };

    const handleActionComplete = () => {
        sessionStorage.removeItem(CERTIFICATE_PAYMENT_MODAL_STORAGE_KEY);
        setSelectedPaymentId(null);
        setRefresh((prev) => prev + 1);
    };

    const handleSelectStudent = (studentData) => {
        if (!studentData) {
            return;
        }

        sessionStorage.setItem(
            CERTIFICATE_ISSUED_MODAL_STORAGE_KEY,
            JSON.stringify(studentData)
        );
        sessionStorage.setItem(
            CERTIFICATE_ACTIVE_TAB_STORAGE_KEY,
            'issued'
        );
        setActiveTab('issued');
        setSelectedStudent(studentData);
    };

    const handleActiveTabChange = (tab) => {
        setActiveTab(tab);
        sessionStorage.setItem(
            CERTIFICATE_ACTIVE_TAB_STORAGE_KEY,
            tab
        );
    };

    const handleCloseIssuedModal = () => {
        sessionStorage.removeItem(CERTIFICATE_ISSUED_MODAL_STORAGE_KEY);
        sessionStorage.removeItem(CERTIFICATE_ISSUED_DETAILS_STORAGE_KEY);
        setSelectedStudent(null);
    };

    return (
        <div className='certificate-approval-page'>
            <header className='certificate-approval-header'>
                <div>
                    <h1>Certificate Approval</h1>

                    <p>
                        Review certificate requests and manage
                        issued certificates.
                    </p>
                </div>
            </header>

            <SectionTabs
                tabs={CERTIFICATE_TABS}
                activeTab={activeTab}
                onChange={handleActiveTabChange}
                className='certificate-approval-tabs'
            />

            <div className='certificate-approval-content'>
                {activeTab === 'pending' && (
                    <PendingCertificatePayments
                        refresh={refresh}
                        onSelectPayment={handleSelectPayment}
                    />
                )}

                {activeTab === 'issued' && (
                    <IssuedCertificates
                        refresh={refresh}
                        onSelectStudent={handleSelectStudent}
                    />
                )}
            </div>

            {selectedPaymentId && (
                <CertificatePaymentDetails
                    paymentId={selectedPaymentId}
                    onClose={() => {
                        sessionStorage.removeItem(
                            CERTIFICATE_PAYMENT_MODAL_STORAGE_KEY
                        );
                        setSelectedPaymentId(null);
                    }}
                    onActionComplete={handleActionComplete}
                />
            )}

            {selectedStudent && (
                <IssuedCertificatesModal
                    studentData={selectedStudent}
                    onClose={handleCloseIssuedModal}
                />
            )}
        </div>
    );
}
