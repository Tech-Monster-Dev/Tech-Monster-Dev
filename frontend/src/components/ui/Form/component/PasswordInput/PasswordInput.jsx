import { useState } from "react";
import "./PasswordInput.css";

import {
    FaEye,
    FaEyeSlash,
    FaLock
} from "react-icons/fa";

import Textinput from "../Textinput";

function PasswordInput({
    label = "Password",
    name,
    value,
    onChange,
    placeholder = "Enter Password",
    error,
    required = false,
    showStrength = false,
    ...props

}) {
    const [showPassword, setShowPassword] = useState(false);

    const getStrength = (password) => {
        if (!password) return "";
        if (password.length < 6) return "Weak";

        if (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
        ) {
            return "Strong";
        }
        return "Medium";
    };
    const strength = getStrength(value);

    return (
        <div className="password-group">
            <Textinput
                label={label}
                type={showPassword ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                error={error}
                required={required}
                icon={<FaLock />}
                {...props}
            />

            <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={
                    showPassword
                        ? "Hide password"
                        : "Show password"
                }
            >
                {
                    showPassword
                        ? <FaEyeSlash />
                        : <FaEye />
                }
            </button>

            {
                showStrength && value && (
                    <div className={`password-strength ${strength.toLowerCase()}`}>
                        {strength}
                    </div>
                )
            }
        </div>
    );
}
export default PasswordInput;