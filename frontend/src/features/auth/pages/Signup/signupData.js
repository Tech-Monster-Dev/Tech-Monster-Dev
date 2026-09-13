export const signupRules = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    minLengthMessage: "First name must be at least 3 characters",
    maxLengthMessage: "First name too long",
  },

  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: "Please enter a valid email",
  },

  password: {
    required: true,
    minLength: 8,
    minLengthMessage: "Password must be at least 8 characters",
    pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/,
    patternMessage: "At least one uppercase letter, one lowercase letter, one number and one special character",
  },

  confirmPassword: {
    required: true,
    requiredMessage: "Password confirmation is required",
  },

  terms: {
    required: true,
    requiredMessage: "Please accept Terms & Conditions",
  },
};

export const fields = [
  {
    name: "username",
    label: "Username",
    placeholder: "@Username",
    type: "text",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter your email",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    required: true,
  },
];
