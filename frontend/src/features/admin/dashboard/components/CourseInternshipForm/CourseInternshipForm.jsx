import "./CourseInternshipForm.css";

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiSave } from "react-icons/fi";
import { toast } from "react-toastify";

import BackButton from "../../../../../components/ui/Button/BackButton/BackButton";
import DashButton from "../../../../../components/ui/Button/DashButton/DashButton";
import Form from "../../../../../components/ui/Form";

import {
    createCourse,
    updateCourse,
} from "../../../../../services/api/course.service";

import {
    createInternship,
    updateInternship,
} from "../../../../../services/api/internship.service";

import {
    validateField,
    validateForm,
} from "../../../../../shared/utils/validation/formValidation";

const INITIAL_FORM = {
    image: "",
    title: "",
    slug: "",
    category: "",
    level: "",
    description: "",
    duration: "",
    price: "",
    totalTasks: "",
    totalNotes: "",
};

import { FIELD_RULES } from "./utils/courseInternshipFormData";

const getImageUrl = (image) => {
    if (!image || typeof image !== "string") {
        return "";
    }

    if (
        image.startsWith("http") ||
        image.startsWith("data:") ||
        image.startsWith("blob:")
    ) {
        return image;
    }

    const apiUrl = import.meta.env.VITE_API_URL;

    return `${apiUrl}/${image.replace(/^\/+/, "")}`;
};

const getInitialFormData = (editData) => {
    if (!editData) {
        return { ...INITIAL_FORM };
    }

    return {
        ...INITIAL_FORM,
        title: editData.title || "",
        slug: editData.slug || "",
        category: editData.category || "",
        level: editData.level || "",
        description: editData.description || "",
        duration: editData.duration || "",
        price: editData.price ?? "",
        totalTasks: editData.totalTasks ?? "",
        totalNotes: editData.totalNotes ?? "",
        image: getImageUrl(editData.img || editData.thumbnail),
    };
};

export default function CourseInternshipForm({ type }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isCourse = type === "course";
    const entityLabel = isCourse ? "Course" : "Internship";

    const editData = isCourse
        ? location.state?.courseData
        : location.state?.internshipData;

    const isEditMode = Boolean(editData);

    const [formData, setFormData] = useState(() =>
        getInitialFormData(editData)
    );

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const nextData = getInitialFormData(editData);

        queueMicrotask(() => {
            setFormData(nextData);
            setErrors({});
        });
    }, [editData, type]);

    const fields = useMemo(
        () => [
            {
                name: "image",
                type: "image",
                label: "Choose a " + entityLabel.toLowerCase() + " logo",
                accept: "image/*",
                placeholder: "Choose a " + entityLabel.toLowerCase() + " logo",
                wrapperClassName: "courseInternshipFormImageField",
            },

            {
                name: "title",
                label: "Title",
                placeholder: "Enter title",
                required: !isEditMode,
                maxLength: 120,
                wrapperClassName: "courseInternshipFormTitleField",
            },

            {
                name: "slug",
                label: "Slug",
                placeholder: "Enter slug",
                required: !isEditMode,
                maxLength: 120,
            },

            {
                name: "category",
                label: "Category",
                placeholder: "Enter category",
                required: !isEditMode,
                maxLength: 80,
            },

            {
                name: "level",
                label: "Level",
                placeholder: "Enter level",
                required: !isEditMode,
                maxLength: 60,
            },

            {
                name: "duration",
                label: "Duration",
                placeholder: "e.g. 3 Months",
                required: !isEditMode,
                maxLength: 60,
            },

            {
                name: "price",
                label: "Certificate Fee",
                placeholder: "Enter certificate fee",
                type: "number",
                min: 0,
                step: "0.01",
                required: !isEditMode,
            },

            {
                name: "totalTasks",
                label: "Total Tasks",
                placeholder: "Enter total tasks",
                type: "number",
                min: 0,
                step: 1,
                required: !isEditMode,
            },

            {
                name: "totalNotes",
                label: "Total Notes",
                placeholder: "Enter total notes",
                type: "number",
                min: 0,
                step: 1,
                required: !isEditMode,
            },

            {
                name: "description",
                type: "textarea",
                label: "Description",
                placeholder: "Enter description",
                required: !isEditMode,
                rows: 5,
                maxLength: 1000,
                wrapperClassName:
                    "courseInternshipFormDescriptionField",
            },
        ],
        [entityLabel, isEditMode]
    );

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        setErrors((current) => ({
            ...current,
            [name]: isEditMode
                ? ""
                : validateField(name, value, FIELD_RULES),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isEditMode) {
            const validation = validateForm(
                formData,
                FIELD_RULES
            );

            setErrors(validation.errors);

            if (!validation.isValid) {
                toast.error(
                    "Please complete all required fields."
                );
                return;
            }
        }

        setSubmitting(true);

        const data = new FormData();

        [
            "title",
            "slug",
            "category",
            "level",
            "description",
            "duration",
            "price",
            "totalTasks",
            "totalNotes",
        ].forEach((field) => {
            data.append(field, formData[field]);
        });

        if (formData.image instanceof File) {
            data.append("img", formData.image);
        }

        try {
            let response;

            if (isCourse) {
                response = isEditMode
                    ? await updateCourse(
                          editData._id || editData.id,
                          data
                      )
                    : await createCourse(data);
            } else {
                response = isEditMode
                    ? await updateInternship(
                          editData._id || editData.id,
                          data
                      )
                    : await createInternship(data);
            }

            if (response.data.success) {
                toast.success(
                    isEditMode
                        ? `${entityLabel} updated successfully`
                        : `${entityLabel} created successfully`
                );

                navigate("/admin/dashboard");
            }
        } catch (error) {
            console.error(
                `Error submitting ${entityLabel.toLowerCase()}:`,
                error
            );

            toast.error(
                error.response?.data?.message || `Unable to save ${entityLabel.toLowerCase()}`
            );
        } finally {
            setSubmitting(false);
        }
    };

    const heading = isEditMode
        ? `Edit ${entityLabel} Form`
        : `${entityLabel} Add Form`;

    return (
        <section className="courseInternshipFormPage">
            <header className="courseInternshipFormHeader">
                <BackButton
                    to="/admin/dashboard"
                    label="Back to Courses & Internships"
                    className="courseInternshipFormBackButton"
                />

                <div className="courseInternshipFormHeading">
                    <span>Learning Management</span>

                    <h1>{heading}</h1>

                    <p>
                        {isEditMode
                            ? `Update the ${entityLabel.toLowerCase()} details below.`
                            : `Add a new ${entityLabel.toLowerCase()} to your learning programs.`}
                    </p>
                </div>
            </header>

            <Form
                fields={fields}
                values={formData}
                errors={errors}
                onChange={handleChange}
                onSubmit={handleSubmit}
                buttonComponent={DashButton}
                formClassName="courseInternshipForm"
                actions={[
                    {
                        id: "save-course-internship",
                        component: DashButton,
                        type: "submit",
                        variant: "primary",
                        size: "large",
                        icon: <FiSave />,
                        iconPosition: "left",
                        label: isEditMode
                            ? `Update ${entityLabel}`
                            : `Create ${entityLabel}`,
                        loading: submitting,
                        loadingText: "Saving...",
                        disabled: submitting,
                    },
                ]}
            />
        </section>
    );
}