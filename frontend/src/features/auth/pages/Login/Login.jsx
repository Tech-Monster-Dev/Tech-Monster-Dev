import "./Login.css";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Hash from "../../../dashboard/common/LoaderPage/Hash";

import AuthLayout from "../../../../layouts/AuthLayout";

import Input from "../../../../components/ui/Input";
import PasswordInput from "../../../../components/ui/PasswordInput";
import AuthButton from "../../../../components/ui/Button/AuthButton";

import { FaEnvelope } from "react-icons/fa";

import { login as loginService } from "../../../../services/api/authService";
import useAuth from "../../../../shared/hooks/useAuth";


function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("logoutSuccess")) {
      toast.success("Logout Successfully");
      sessionStorage.removeItem("logoutSuccess");
    }
  }, []);

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("rememberMe") === "true";
  });

  useEffect(() => {

    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const isRemembered = localStorage.getItem("rememberMe") === "true";

    if (rememberedEmail && isRemembered) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const saveCredential = async ({
    email,
    password,
    username
  }) => {

    if (!rememberMe) return;

    if (
      !window.isSecureContext ||
      !("credentials" in navigator) ||
      !("PasswordCredential" in window)
    ) {
      return;
    }

    try {

      const credential =
        new PasswordCredential({
          id: email,
          password,
          name: username || email
        });

      await navigator.credentials.store(
        credential
      );

    } catch (error) {

      console.warn(
        "Password Manager save unavailable:",
        error
      );

    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) {
      return setError(
        "Please fill all fields."
      );
    }
    try {
      setLoading(true);
      const response = await loginService(formData);
      const {
        accessToken,
        user
      } = response.data;


      /* =========================================
         REMEMBER ME
      ========================================= */

      if (rememberMe) {

        localStorage.setItem(
          "rememberMe",
          "true"
        );

        localStorage.setItem(
          "rememberedEmail",
          formData.email
        );


        // Ask browser password manager
        await saveCredential({

          email: formData.email,

          password: formData.password,

          username: user?.username || formData.email

        });

      } else {

        localStorage.removeItem(
          "rememberMe"
        );

        localStorage.removeItem(
          "rememberedEmail"
        );

      }

      // Store Auth Data
      login({
        token: accessToken,
        user
      });
      // Role Based Dashboard Navigation

      if (user.role === "student") {
        navigate("/student");
      } else if (user.role === "admin") {
        navigate("/admin");
      }
      else {
        navigate("/login");
      }
    }
    catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed."
      );
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <>

      {
        loading && (
          <Hash
            fullScreen
            message="Logging you in..."
            size={70}
          />
        )
      }


      <AuthLayout
        title="Welcome Back"
        subtitle="Login to continue your internship journey."
      >

        <motion.form
          className="login-form"
          onSubmit={handleSubmit}
          autoComplete="on"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            icon={<FaEnvelope />}
            autoComplete="username"
            required
          />

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {
            error &&
            <p className="login-error">
              {error}
            </p>
          }

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
              />
              <span>
                Remember Me
              </span>
            </label>


            <Link
              to="/forgot-password"
              className="forgot-link"
            >
              Forgot Password?
            </Link>
          </div>

          <AuthButton
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? "Logging In..." : "Login"}
          </AuthButton>

          <p className="signup-text">
            Don't have an account?
            <Link to="/signup">Create Account </Link>
          </p>

          <p className="signup-text">
            Log in as a admin
            <Link to="/admin_login">Admin login</Link>
          </p>
        </motion.form>

      </AuthLayout>
    </>
  );
}


export default Login;