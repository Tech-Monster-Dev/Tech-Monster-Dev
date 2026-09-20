import "./DashButton.css";

function DashButton({
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
    loadingText = "Loading...",
    size = "medium",
    ariaLabel,
    title,
}) {
    const buttonClasses = [
        "dash-button",
        `dash-button-${variant}`,
        `dash-button-${size}`,
        fullWidth ? "dash-button-full-width" : "",
        className,
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
            title={title}
        >
            {loading ? (
                <span className="dash-button-loading">
                    <span className="dash-button-spinner" />
                    <span>{loadingText}</span>
                </span>
            ) : (
                <span className="dash-button-content">
                    {icon && iconPosition === "left" && (
                        <span className="dash-button-icon">
                            {icon}
                        </span>
                    )}

                    <span className="dash-button-text">
                        {children}
                    </span>

                    {icon && iconPosition === "right" && (
                        <span className="dash-button-icon">
                            {icon}
                        </span>
                    )}
                </span>
            )}
        </button>
    );
}

export default DashButton;