import "./AuthButton.css";

function AuthButton({
    children,
    type = "submit",
    onClick,
    disabled = false,
    className = "",
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`auth-button ${className}`}
        >
            <span className="auth-button-content">
                {children}
            </span>
        </button>
    );
}

export default AuthButton;