import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
    updateProfileField,
    uploadProfileImage
} from "../../../../../../services/api/profileService";


export default function useProfileEdit({
    userData,
    onUpdateData
}) {

    const [data, setData] = useState(userData);

    const [editingField, setEditingField] =
        useState(null);

    const [tempValue, setTempValue] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const [imageLoading, setImageLoading] =
        useState(false);


    // ==============================
    // SYNC USER DATA
    // ==============================

    useEffect(() => {

        queueMicrotask(() => {
            setData(userData);
        });

    }, [userData]);


    // ==============================
    // START EDIT
    // ==============================

    const handleEditClick = (
        fieldName,
        currentValue
    ) => {

        setEditingField(fieldName);

        setTempValue(
            currentValue ?? ""
        );
    };


    // ==============================
    // CANCEL EDIT
    // ==============================

    const handleCancel = () => {

        setEditingField(null);

        setTempValue("");

    };


    // ==============================
    // SAVE FIELD
    // ==============================

    const handleSave = async (field) => {

        if (saving) return;

        try {

            setSaving(true);

            const response =
                await updateProfileField({
                    [field]: tempValue
                });

            const updatedUser =
                response.data.user;

            setData(updatedUser);

            onUpdateData(updatedUser);

            setEditingField(null);

            setTempValue("");

            toast.success(
                "Profile updated successfully!"
            );

        } catch (error) {

            console.error(
                "Profile Update Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to update profile"
            );

        } finally {

            setSaving(false);

        }
    };


    // ==============================
    // IMAGE UPDATE
    // ==============================

    const handleImageUpdate = async (e) => {

        try {

            const file =
                e.target.files?.[0];

            if (!file) return;

            setImageLoading(true);

            const formData =
                new FormData();

            formData.append(
                "avatar",
                file
            );

            const response =
                await uploadProfileImage(
                    formData
                );

            const updatedUser =
                response.data.user;

            setData(updatedUser);

            onUpdateData(updatedUser);

            toast.success(
                "Profile photo updated!"
            );

        } catch (error) {

            console.error(
                "Profile Image Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to update profile photo"
            );

        } finally {

            setImageLoading(false);

            e.target.value = "";

        }
    };


    return {

        data,

        editingField,
        tempValue,

        saving,
        imageLoading,

        setTempValue,

        handleEditClick,
        handleCancel,
        handleSave,
        handleImageUpdate

    };
}
