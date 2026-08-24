import "./PublicButton.css";

function PublicButton({
    children,
    type = "button",
    onClick,
    disabled = false,
    className = "",
    variant = "primary",
    icon = null,
    iconPosition = "right",
    fullWidth = false,
    loading = false,
    background = true,
    size = "medium",
    ariaLabel
}) {
    const buttonClasses = [
        "public-button",
        `public-button-${variant}`,
        `public-button-${size}`,
        background ? "" : "public-button-no-background",
        fullWidth ? "public-button-full-width" : "",
        className
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={buttonClasses}
            aria-label={ariaLabel}
        >
            {loading ? (
                <span className="public-button-loading">
                    <span className="public-button-spinner"></span>
                    <span>Loading...</span>
                </span>
            ) : (
                <span className="public-button-content">

                    {icon && iconPosition === "left" && (
                        <span className="public-button-icon">
                            {icon}
                        </span>
                    )}

                    <span className="public-button-text">
                        {children}
                    </span>

                    {icon && iconPosition === "right" && (
                        <span className="public-button-icon">
                            {icon}
                        </span>
                    )}

                </span>
            )}
        </button>
    );
}

export default PublicButton;