import { useState } from "react";

import Spinner from "../../../../../dashboard/common/LoaderPage/Spinner";

export default function PaymentQRCode({ imageUrl }) {
    const [loaded, setLoaded] = useState(false);

    if (!imageUrl) return null;

    return (
        <div className="certificate-payment-qr-only">
            {!loaded && (
                <Spinner
                    message="Generating..."
                    size={35}
                />
            )}

            <img
                src={imageUrl}
                alt="Certificate payment UPI QR code"
                onLoad={() => setLoaded(true)}
                className={loaded ? "qr-code-loaded" : "qr-code-loading"}
            />
        </div>
    );
}
