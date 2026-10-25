import cloudinary from "./cloudinary.js";
import streamifier from "streamifier";

const uploadToCloudinary = (file, folder = "tech-monster") => {
    return new Promise((resolve, reject) => {
        const isPDF = file.mimetype === "application/pdf";
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: isPDF ? "raw" : "image"
            },

            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );
        streamifier
            .createReadStream(file.buffer)
            .pipe(stream);
    });
};

export default uploadToCloudinary;