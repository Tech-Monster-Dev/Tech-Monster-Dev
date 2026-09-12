import "./Select.css";

function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error,
  required = false,
  disabled = false,
  ...props
}) {
  return (
    <div className="select-group">

      {label && (
        <label className="select-label">
          {label}
          {required && <span>*</span>}
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`select ${error ? "select-error" : ""}`}
        {...props}
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (

          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>

        ))}

      </select>

      {error && (
        <small className="select-error-message">
          {error}
        </small>
      )}

    </div>
  );
}

export default Select;