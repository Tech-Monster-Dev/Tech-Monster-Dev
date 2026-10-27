import "./Signup.css";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import Hash from "../../../../features/dashboard/common/LoaderPage/Hash";

import AuthLayout from "../../../../layouts/AuthLayout";

import Form from "../../../../components/ui/Form/Form";
import Checkbox from "../../../../components/ui/Form/component/Checkbox";
import AuthButton from "../../../../components/ui/Button/AuthButton";
import PasswordStrength from "../../../../components/ui/Form/component/PasswordStrength";

import { signup as signupService } from "../../../../services/api/authService";

import { validateField, validateForm } from "../../../../shared/utils/validation/formValidation.js";
import { signupRules, fields } from "./signupData.js";

function Signup() {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const submitInFlightRef = useRef(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
    role: "student",
  });



  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    const updatedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, updatedValue, signupRules)
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitInFlightRef.current) return;

    const {
      errors: newErrors,
      isValid: formIsValid
    } = validateForm(
      formData,
      signupRules
    );

    const validationErrors = {
      ...newErrors,
    };

    if (
      formData.password !== formData.confirmPassword
    ) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.terms) {
      validationErrors.terms = "Please accept Terms & Conditions";
    }

    const isValid = formIsValid && formData.password === formData.confirmPassword && formData.terms;

    setErrors(validationErrors);

    if (!isValid) {
      return;
    }

    submitInFlightRef.current = true;
    setLoading(true);

    try {
      await signupService(formData);

      const expiresAt = Date.now() + 10 * 60 * 1000;
      localStorage.setItem(
        "signupOtpExpiresAt",
        expiresAt.toString()
      );

      sessionStorage.setItem("signupOtpEmail", formData.email);
      setTimeout(() => {
        router.push("/auth/verify-signup-otp");
      }, 100);
      toast.success("OTP sent to your Gmail account.");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Something went wrong";

      toast.error(message);
      setError(message);
    } finally {
      submitInFlightRef.current = false;
      setLoading(false);
    }
  };

  const actions = [
    {
      label: "Create Account",
      type: "submit",
      component: AuthButton,
      fullWidth: true,
      disabled: loading,
    },
  ];

  return (
    <>
      {loading && (
        <Hash
          fullScreen
          message="Sending OTP to your Gmail..."
          size={70}
        />
      )}

      <AuthLayout
        title="Create Account"
        subtitle="Join Tech Monster Pvt. Ltd."
      >
        <Form
          fields={fields}
          values={formData}
          errors={errors}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          formClassName="signup-form"
          actions={actions}
        >
          <PasswordStrength
            password={formData.password}
          />

          {error && (
            <p className="signup-error">
              {error}
            </p>
          )}

          <div>
            <Checkbox
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleInputChange}
              label={
                <>
                  I accept{" "}
                  <Link href="/terms-and-conditions">
                    Terms & Conditions
                  </Link>
                </>
              }
              error={errors.terms}
            />
          </div>

          <p className="login-link">
            Already have an account?
            <Link href="/auth/login">
              Login
            </Link>
          </p>
        </Form>
      </AuthLayout>
    </>
  );
}

export default Signup;