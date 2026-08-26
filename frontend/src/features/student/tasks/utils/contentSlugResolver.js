import api from "../../../../services/api/axios";
import { normalizeSlug } from "./taskUtils";

const getApiResource = (contentType) => {
    return contentType === "internship"
        ? "internships"
        : "courses";
};

const findList = (data) => {
    return (
        Object.values(data || {})
            .find((value) => Array.isArray(value)) ||
        []
    );
};

const findEnrolledSlug = (items) => {
    const item = items.find(
        (entry) =>
            entry?.slug ||
            entry?.course?.slug ||
            entry?.internship?.slug
    );

    return (
        item?.slug ||
        item?.course?.slug ||
        item?.internship?.slug ||
        null
    );
};

export const resolveContentSlug = async (
    contentType
) => {
    const type = String(contentType || "")
        .trim()
        .toLowerCase();

    if (!type) {
        return null;
    }

    const resource = getApiResource(type);

    try {
        const response = await api.get(
            `/${resource}/student/my`
        );

        const enrolledSlug = findEnrolledSlug(
            findList(response?.data)
        );

        if (enrolledSlug) {
            return normalizeSlug(enrolledSlug);
        }
    } catch (error) {
        console.warn(
            `Failed to load ${resource} enrollment:`,
            error
        );
    }

    try {
        const response = await api.get(
            `/${resource}`
        );

        const items = findList(response?.data);
        const firstItem = items.find(
            (item) => item?.slug
        );

        return firstItem?.slug
            ? normalizeSlug(firstItem.slug)
            : null;
    } catch (error) {
        console.warn(
            `Failed to load ${resource}:`,
            error
        );

        return null;
    }
};
