import "./TextArea.css";

function TextArea({
  label,
  name,
  value = "",
  placeholder,
  onChange,
  rows = 5,
  error,
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className="textarea-group">
      {label && (
        <label
          className="textarea-label"
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

      <textarea
        id={name}
        className={`textarea ${error ? "inputError" : ""
          } ${className}`.trim()}
        name={name}
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={onChange}
        {...props}
      />

      {error && (
        <small className="errorText">
          {error}
        </small>
      )}
    </div>
  );
}

export default TextArea;