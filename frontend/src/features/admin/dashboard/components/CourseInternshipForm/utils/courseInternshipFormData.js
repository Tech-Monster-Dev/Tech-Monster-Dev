export const FIELD_RULES = {
    title: {
        required: true,
        requiredMessage: "Title is required",
    },
    slug: {
        required: true,
        requiredMessage: "Slug is required",
    },
    category: {
        required: true,
        requiredMessage: "Category is required",
    },
    level: {
        required: true,
        requiredMessage: "Level is required",
    },
    description: {
        required: true,
        requiredMessage: "Description is required",
    },
    duration: {
        required: true,
        requiredMessage: "Duration is required",
    },
    price: {
        required: true,
        requiredMessage: "Certificate fee is required",
    },
    offer: {
        required: true,
        requiredMessage: "Offer is required",
        validate: (value) => {
            if (!/^\d+$/.test(String(value))) {
                return "Offer must be a whole number from 0 to 100";
            }

            const offer = Number(value);
            return offer >= 0 && offer <= 100
                ? ""
                : "Offer must be a whole number from 0 to 100";
        },
    },
    totalTasks: {
        required: true,
        requiredMessage: "Total tasks is required",
    },
    totalNotes: {
        required: true,
        requiredMessage: "Total notes is required",
    },
}