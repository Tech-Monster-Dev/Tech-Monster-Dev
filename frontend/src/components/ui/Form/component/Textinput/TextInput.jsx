import "./TextInput.css";

function TextInput({
    label,
    type = "text",
    name,
    value = "",
    placeholder,
    onChange,
    error,
    required = false,
    className = "",
    maxLength,
    ...props
}) {
    return (
        <div className="input-group">
            {label && (
                <label
                    className="input-label"
                    htmlFor={name}
                >
                    {label}

                    {required && (
                        <span
                            className={
                                value?.trim()
                                    ? "labelSpanGreen"
                                    : "labelSpanRed"
                            }
                        >
                            *
                        </span>
                    )}
                </label>
            )}

            <div className="input-wrapper">
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    className={`input ${
                        error ? "inputError" : ""
                    } ${className}`.trim()}
                    maxLength={maxLength}
                    {...props}
                />
            </div>

            {error && (
                <small className="errorText">
                    {error}
                </small>
            )}
        </div>
    );
}

export default TextInput;