import "./PriceDisplay.css";

import { getProgramPriceDisplay } from "./priceDisplay.js";

export default function PriceDisplay({ price, offer }) {
    const display = getProgramPriceDisplay(price, offer);

    if (display.offerPercentage === 0) {
        return (
            <div className="programPriceDisplay">
                <strong className="programPriceRegular">
                    {display.originalPrice}
                </strong>
            </div>
        );
    }

    return (
        <div className="programPriceDisplay">
            <div className="programPriceDetails">
                <span className="programPriceOriginal">
                    {display.originalPrice}
                </span>
                <span className="programPriceOffer">
                    {display.offerPercentage}% OFF
                </span>
            </div>
            <strong className="programPriceFinal">
                {display.discountedPrice}
            </strong>
        </div>
    );
}
