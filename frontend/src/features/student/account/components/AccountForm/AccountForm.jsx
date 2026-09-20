import "./AccountForm.css";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";


import Form from "../../../../../components/ui/Form/Form";
import Textinput from "../../../../../components/ui/Form/component/Textinput";
import DashButton from "../../../../../components/ui/Button/DashButton";

import useAuth from "../../../../../shared/hooks/useAuth";
import { tokenStorage } from "../../../../../services/auth/tokenStorage";

import {
    updateProfile,
    uploadProfileImage
} from "../../../../../services/api/profileService";

import {
    getInitialFormData
} from "../../../../../shared/utils/initialFormData";

import {
    validateField,
    validateForm
} from "../../../../../shared/utils/validation/formValidation";

import { accountRules } from "./validation/accountRules";

import useProfileImage from "./hooks/useProfileImage";
import usePincode from "./hooks/usePincode";
import useSkills from "./hooks/useSkills";

import {
    SkillsInput
} from "./components";

import {
    getAccountFormSections
} from "./accountFormData";


export default function AccountForm({
    initialEmail,
    editData,
    onSubmitForm
}) {
    const { updateUser } = useAuth();
    const loginUser = tokenStorage.getUser();
    const draftUserId =
        loginUser?._id ||
        loginUser?.id ||
        editData?._id ||
        editData?.id ||
        loginUser?.email ||
        initialEmail ||
        "guest";
    const draftStorageKey = `accountFormDraft:${draftUserId}`;

    const [formData, setFormData] = useState(() => {
        const initialData = getInitialFormData(
            loginUser?.email ||
            initialEmail ||
            ""
        );

        let savedDraft = {};

        try {
            const storedDraft = localStorage.getItem(draftStorageKey);
            savedDraft = storedDraft ? JSON.parse(storedDraft) : {};
        } catch (error) {
            console.error("Account form draft load error:", error);
        }

        return {
            ...initialData,
            ...(editData || {}),
            ...(savedDraft || {})
        };
    });

    useEffect(() => {
        try {
            localStorage.setItem(
                draftStorageKey,
                JSON.stringify(formData)
            );
        } catch (error) {
            console.error("Account form draft save error:", error);
        }
    }, [formData, draftStorageKey]);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const {
        imageFile,
        preview,
        handleImageChange
    } = useProfileImage(editData?.avatar);

    const {
        handlePincode
    } = usePincode(setFormData);

    const {
        skillInput,
        setSkillInput,
        addSkill,
        removeSkill
    } = useSkills(formData, setFormData);

    const isProfileCompleted = Boolean(
        editData?.profileCompleted
    );

    const isProfileImageRequired = !isProfileCompleted;

    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        if (name === "avatar") {
            handleImageChange(event);

            setErrors((prev) => ({
                ...prev,
                avatar: ""
            }));

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: validateField(
                name,
                value,
                accountRules
            )
        }));

        if (name === "pincode") {
            handlePincode(value);
        }
    };

    const handleAddSkill = () => {
        const skill = skillInput.trim();
        const canAddSkill =
            Boolean(skill) &&
            formData.skills.length < 7 &&
            !formData.skills.includes(skill);

        addSkill();

        const nextSkills = canAddSkill
            ? [...formData.skills, skill]
            : formData.skills;

        setErrors((prev) => ({
            ...prev,
            skills: validateField(
                "skills",
                nextSkills,
                accountRules
            )
        }));
    };

    const handleRemoveSkill = (index) => {
        const nextSkills = formData.skills.filter(
            (_, skillIndex) => skillIndex !== index
        );

        removeSkill(index);

        setErrors((prev) => ({
            ...prev,
            skills: validateField(
                "skills",
                nextSkills,
                accountRules
            )
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const {
            errors: validationErrors,
            isValid: formIsValid
        } = validateForm(
            formData,
            accountRules
        );

        const nextErrors = {
            ...validationErrors
        };

        if (
            isProfileImageRequired &&
            !imageFile
        ) {
            nextErrors.avatar =
                "Profile photo is required";
        }

        const isValid =
            formIsValid &&
            (
                !isProfileImageRequired ||
                Boolean(imageFile)
            );

        setErrors(nextErrors);

        if (!isValid) {
            return;
        }

        setLoading(true);

        try {
            let latestUser = null;

            if (imageFile) {
                const form = new FormData();

                form.append(
                    "avatar",
                    imageFile
                );

                const response =
                    await uploadProfileImage(form);

                latestUser = response.data.user;
            }

            const response =
                await updateProfile(formData);

            latestUser = response.data.user;

            const latestStats =
                response.data.stats;

            updateUser(latestUser);

            onSubmitForm({
                ...latestUser,
                profileStats: latestStats
            });

            localStorage.removeItem(draftStorageKey);

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
                "Profile update failed"
            );
        } finally {
            setLoading(false);
        }
    };

    const sections = getAccountFormSections({
        isProfileImageRequired,
        formData,
        preview,
        skillInput,
        setSkillInput,
        handleAddSkill,
        handleRemoveSkill,
        SkillsInput,
        Textinput
    });

    const actions = [
        {
            label: isProfileCompleted ? "Update Profile" : "Save & Profile view",
            loading,
            loadingText: isProfileCompleted ? "Updating..." : "Saving...",
            type: "submit",
            component: DashButton,
            variant: "primary",
        }
    ];

    return (
        <>
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20
                }}
                animate={{
                    opacity: 1,
                    y: 0
                }}
                transition={{
                    duration: 0.5
                }}
            >
                <Form
                    sections={sections}
                    values={formData}
                    errors={errors}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    actions={actions}
                    formClassName="account-form-container"
                    disabled={loading}
                />
            </motion.div>
        </>
    );
}
