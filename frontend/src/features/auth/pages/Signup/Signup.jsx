import "./Signup.css";

import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "react-toastify";
import Hash from '../../../../features/dashboard/common/LoaderPage/Hash';


import AuthLayout from "../../../../layouts/AuthLayout";

import Input from "../../../../components/ui/Input";
import PasswordInput from "../../../../components/ui/PasswordInput";
import AuthButton from "../../../../components/ui/Button/AuthButton";
import PasswordStrength from "../../../../components/ui/PasswordStrength";

import { signup as signupService } from "../../../../services/api/authService";

import { signupSchema } from "../../../../validations/auth/signupSchema";




function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {

    register,
    handleSubmit,
    watch,
    formState: { errors }

  } = useForm({

    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
      role: "student",
    }

  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const username = watch("username") || "";
  const email = watch("email") || "";
  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";


  const navigate = useNavigate();

  const onSubmit = async (data) => {

    setError("");
    setLoading(true);

    try {

      await signupService(data);

      toast.success("OTP sent to your Gmail account.");

      setTimeout(() => {

        navigate("/verify-signup-otp", {
          state: {
            email: data.email
          }
        });

      }, 800);

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong"
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Sign up failed"
      );
    } finally {

      setLoading(false);

    }

  };

  return (
    <>

      {
        loading && (

          <Hash
            fullScreen
            message="Sending OTP to your Gmail..."
            size={70}
          />

        )
      }
      <AuthLayout
        title="Create Account"
        subtitle="Join Tech Monster Pvt. Ltd."
      >
        <motion.form
          id="signup-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            label="Username"
            placeholder="@Username"
            value={username}
            {...register("username")}
            error={errors.username?.message}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            {...register("email")}
            error={errors.email?.message}
          />


          <PasswordInput
            label="Password"
            showStrength
            value={password}
            {...register("password")}
            error={errors.password?.message}
          />

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />


          <PasswordStrength password={watch("password")} />

          {error && <p className="signup-error">{error}</p>}

          <label id="terms">
            <input
              type="checkbox"
              {...register("terms")}
            />
            I accept Terms & Conditions
            <Link to="/terms-and-conditions"> Terms & Conditions</Link>
          </label>
          <p id="terms-error">{errors.terms?.message}</p>

          <AuthButton
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </AuthButton>

          <p id="login-link">
            Already have an account?
            <Link to="/login">
              Login
            </Link>
          </p>


        </motion.form>

      </AuthLayout>
    </>
  )

}

export default Signup;