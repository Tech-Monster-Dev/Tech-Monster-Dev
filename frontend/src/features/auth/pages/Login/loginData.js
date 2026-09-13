export const fields = [
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
]

export const loginRules = {
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
}