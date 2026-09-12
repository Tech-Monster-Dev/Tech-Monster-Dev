export const validateField = (name, value, rules = {}) => {
    const rule = rules[name];

    if (!rule) return "";

    const trimmedValue = value?.trim?.() ?? value;

    if (rule.required && !trimmedValue) {
        return rule.requiredMessage || "This field is required";
    }

    if (
        rule.minLength &&
        trimmedValue &&
        trimmedValue.length < rule.minLength
    ) {
        return (
            rule.minLengthMessage ||
            `Minimum ${rule.minLength} characters required`
        );
    }

    if (
        rule.maxLength &&
        trimmedValue &&
        trimmedValue.length > rule.maxLength
    ) {
        return (
            rule.maxLengthMessage ||
            `Maximum ${rule.maxLength} characters allowed`
        );
    }

    if (
        rule.pattern &&
        trimmedValue &&
        !rule.pattern.test(trimmedValue)
    ) {
        return rule.patternMessage || "Invalid value";
    }

    if (rule.validate) {
        return rule.validate(trimmedValue, rules);
    }

    return "";
};


export const validateForm = (form, rules = {}) => {
    const errors = {};

    Object.keys(rules).forEach((name) => {
        errors[name] = validateField(
            name,
            form[name],
            rules
        );
    });

    const isValid = Object.values(errors).every(
        (error) => error === ""
    );

    return {
        errors,
        isValid,
    };
};