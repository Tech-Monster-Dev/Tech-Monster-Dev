import { useEffect, useRef, useState } from "react";
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
  className = "",
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue
      }
    });

    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen((current) => !current);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="select-group" ref={selectRef}>
      {label && (
        <label className="select-label" htmlFor={name}>
          {label}
          {required && (
            <span className={value ? "labelSpanGreen" : "labelSpanRed"}>
              *
            </span>
          )}
        </label>
      )}

      <div
        id={name}
        className={[
          "select",
          error ? "select-error" : "",
          isOpen ? "select-open" : "",
          disabled ? "select-disabled" : ""
        ].filter(Boolean).concat(className).filter(Boolean).join(" ")}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span
          className={`select-value ${!selectedOption ? "select-placeholder" : ""}`}
        >
          {displayLabel}
        </span>

        <span className="select-arrow" aria-hidden="true" />

        {isOpen && (
          <div className="select-options" role="listbox">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`select-option ${
                  option.value === value ? "select-option-selected" : ""
                }`}
                role="option"
                aria-selected={option.value === value}
                onClick={(event) => {
                  event.stopPropagation();
                  handleSelect(option.value);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <small className="select-error-message">
          {error}
        </small>
      )}
    </div>
  );
}

export default Select;
