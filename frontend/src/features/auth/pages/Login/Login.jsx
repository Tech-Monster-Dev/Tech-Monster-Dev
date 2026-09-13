import "./Login.css";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Hash from "../../../dashboard/common/LoaderPage/Hash";

import AuthLayout from "../../../../layouts/AuthLayout";

import Form from '../../../../components/ui/Form';
import AuthButton from "../../../../components/ui/Button/AuthButton";
import Checkbox from "../../../../components/ui/Form/component/Checkbox";

import { login as loginService } from "../../../../services/api/authService";
import useAuth from "../../../../shared/hooks/useAuth";
import { validateField, validateForm } from "../../../../shared/utils/validation/formValidation";
import { loginRules, fields } from "./loginData.js";


function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("logoutSuccess")) {
      toast.success("Logout Successfully");
      sessionStorage.removeItem("logoutSuccess");
      sessionStorage.removeItem("logoutInProgress");
    }
  }, []);

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});


  const [formData, setFormData] = useState(() => ({
    email:
      localStorage.getItem("rememberMe") === "true"
        ? localStorage.getItem("rememberedEmail") || ""
        : "",
    password: ""
  }));

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("rememberMe") === "true";
  });

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, loginRules)
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
    
    const {
      errors: newErrors,
      isValid
    } = validateForm(formData, loginRules);

    setErrors(newErrors);

    if (!isValid) return;

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
      const message = err.response?.data?.message || 'Login failed.';
      toast.error(message);
    }
    finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      label: "Login",
      type: "submit",
      component: AuthButton,
      fullWidth: true,
      disabled: loading
    }
  ];

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
        <Form
          fields={fields}
          values={formData}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          formClassName="login-form"
          actions={actions}
        >

          <div className="login-options">
            <Checkbox 
              id="rememberMe"
              name="rememberMe"
              checked={rememberMe}
              onChange={(e) =>setRememberMe(e.target.checked)}
              label={<>Remember Me</>}
            />

            <Link
              to="/forgot-password"
              className="forgot-link"
            >
              Forgot Password?
            </Link>
          </div>

          <p className="signup-text">
            Don't have an account?
            <Link to="/signup">Create Account </Link>
          </p>

          <p className="signup-text">
            Log in as a admin
            <Link to="/admin_login">Admin login</Link>
          </p>
        </Form>
        
      </AuthLayout >
    </>
  );
}


export default Login;