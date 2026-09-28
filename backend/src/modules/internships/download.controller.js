import asyncHandler from "../core/http/asyncHandler.js";
import AppError from "../core/errors/AppError.js";

export const downloadOfferLetter = asyncHandler(
    async (req, res) => {
        const offer = await Offer.findById(
            req.params.id
        );

        if (!offer) {
            throw new AppError(
                "Offer not found",
                404
            );
        }

        if (!offer.offerLetterUrl) {
            throw new AppError(
                "Offer letter not found",
                404
            );
        }

        return res.status(200).json({
            success: true,
            offerLetter: offer.offerLetterUrl
        });
    }
);