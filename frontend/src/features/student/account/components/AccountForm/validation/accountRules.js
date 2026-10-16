export const accountRules = {
    firstName: {
        required: true,
        requiredMessage: "First name is required"
    },

    lastName: {
        required: true,
        requiredMessage: "Last name is required"
    },

    phone: {
        required: true,
        requiredMessage: "Phone number is required"
    },

    gender: {
        required: true,
        requiredMessage: "Please select your gender"
    },

    dateOfBirth: {
        required: true,
        requiredMessage: "Date of birth is required"
    },

    education: {
        required: false,
        requiredMessage: "Education is required"
    },

    college: {
        required: false,
        requiredMessage: "College is required"
    },

    branch: {
        required: false,
        requiredMessage: "Branch is required"
    },

    year: {
        required: false,
        requiredMessage: "Year is required"
    },

    semester: {
        required: false,
        requiredMessage: "Semester is required"
    },

    skills: {
        required: false,
        validate: () => ""
    },

    currentAddress: {
        required: true,
        requiredMessage: "Current address is required"
    },

    localAddress: {
        required: true,
        requiredMessage: "Local address is required"
    },

    pincode: {
        required: true,
        requiredMessage: "Pincode is required",
        pattern: /^\d{6}$/,
        patternMessage: "Pincode must be exactly 6 digits"
    }
};
