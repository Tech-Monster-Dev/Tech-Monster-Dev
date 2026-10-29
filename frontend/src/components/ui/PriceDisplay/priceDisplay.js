const formatOriginalPrice = (price) => {
    if (!Number.isFinite(price) || price <= 0) {
        return "Free";
    }

    return `₹${price.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
};

const formatDiscountedPrice = (price) =>
    `₹${price.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export const getProgramPriceDisplay = (price, offer) => {
    const originalPrice = Number(price);
    const offerPercentage = Number(offer ?? 0);
    const hasDiscount =
        Number.isFinite(originalPrice) &&
        originalPrice > 0 &&
        Number.isInteger(offerPercentage) &&
        offerPercentage > 0 &&
        offerPercentage <= 100;

    return {
        originalPrice: formatOriginalPrice(originalPrice),
        offerPercentage: hasDiscount ? offerPercentage : 0,
        discountedPrice: hasDiscount
            ? formatDiscountedPrice(
                  originalPrice -
                      (originalPrice * offerPercentage) / 100
              )
            : null,
    };
};
