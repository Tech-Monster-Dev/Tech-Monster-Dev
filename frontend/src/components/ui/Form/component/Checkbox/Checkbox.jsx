import "./Checkbox.css";

function Checkbox({
    id,
    name,
    value,
    checked = false,
    onChange,
    label,
    description,
    error,
    disabled = false,
    required = false,
    className = "",
    inputClassName = "",
    labelClassName = "",
    ...props
}) {
    return (
        <div className={`checkbox-wrapper ${className}`.trim()}>
            <label
                htmlFor={id}
                className={`checkbox-label ${labelClassName}`.trim()}
            >
                <input
                    id={id}
                    name={name}
                    type="checkbox"
                    value={value}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    className={`checkbox-input ${inputClassName}`.trim()}
                    {...props}
                />

                <span className="checkbox-content">
                    {label && (
                        <span className="checkbox-text">
                            {label}
                        </span>
                    )}

                    {description && (
                        <span className="checkbox-description">
                            {description}
                        </span>
                    )}
                </span>
            </label>

            {error && (
                <span className="checkbox-error">
                    {error}
                </span>
            )}
        </div>
    );
}

export default Checkbox;