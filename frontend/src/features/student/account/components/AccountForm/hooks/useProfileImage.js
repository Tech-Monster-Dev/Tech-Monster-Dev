import { useEffect, useState } from "react";


export default function useProfileImage(initialImage = "") {

    const [imageFile, setImageFile] = useState(null);

    const getInitialPreview = () => {

        // Backend default image path
        if (
            !initialImage ||
            initialImage === "/profile/default-profile.svg"
        ) {
            return "";
        }

        return initialImage;
    };

    const [preview, setPreview] = useState(
        getInitialPreview()
    );

    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreview(getInitialPreview());

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialImage]);


    const handleImageChange = (e) => {

        const file =
            e.target.files?.[0];

        if (!file) return;


        setImageFile(file);

        setPreview(
            URL.createObjectURL(file)
        );
    };


    return {
        imageFile,
        preview,
        handleImageChange
    };
}
