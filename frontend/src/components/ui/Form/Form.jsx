import "./Form.css";

import Textinput from "./component/Textinput";
import TextArea from "./component/TextArea";
import Select from "./component/Select";
import PasswordInput from "./component/PasswordInput";
import OTPInput from "./component/OTPInput";
import ImageInput from "./component/ImageInput";

function Form({
    fields = [],
    values = {},
    errors = {},
    onChange,
    onSubmit,
    actions = [],
    buttonComponent: DefaultButton = "Button not found",
    className = "",
    formClassName = "",
    children,
    disabled = false,
    noValidate = true,
    ...props
}) {

    const handleChange = (event) => {

        if (onChange) {
            onChange(event);
        }

    };

    const renderField = (field) => {

        if (!field?.name) {
            return null;
        }

        const {
            name,
            type = "text",
            label,
            value,
            placeholder,
            error,
            required = false,
            disabled: fieldDisabled = false,
            className: fieldClassName = "",
            options = [],
            rows,
            icon,
            render,
            ...fieldProps
        } = field;

        const fieldValue = value !== undefined ? value : values[name] ?? "";
        const fieldError = error !== undefined ? error : errors[name];
        const isDisabled = disabled || fieldDisabled;

        if (typeof render === "function") {
            return render({
                field,
                value: fieldValue,
                error: fieldError,
                onChange: handleChange,
                disabled: isDisabled
            });
        }

        const commonProps = {
            name,
            value: fieldValue,
            onChange: handleChange,
            placeholder,
            error: fieldError,
            required,
            disabled: isDisabled,
            className: fieldClassName,
            ...fieldProps
        };

        switch (type) {

            case "textarea":
                return (
                    <TextArea
                        {...commonProps}
                        label={label}
                        rows={rows}
                    />
                );

            case "select":
                return (
                    <Select
                        {...commonProps}
                        label={label}
                        options={options}
                    />
                );

            case "password":
                return (
                    <PasswordInput
                        {...commonProps}
                        label={label}
                        icon={icon}
                    />
                );

            case "otp":
                return (
                    <div className="form-field">

                        {label && (
                            <label className="form-label">
                                {label}

                                {required && (
                                    <span className="form-required">
                                        *
                                    </span>
                                )}
                            </label>
                        )}

                        <OTPInput
                            length={field.length}
                            value={fieldValue}
                            onChange={(value) =>
                                handleChange({
                                    target: {
                                        name,
                                        value
                                    }
                                })
                            }
                        />

                        {fieldError && (
                            <small className="form-error">
                                {fieldError}
                            </small>
                        )}

                    </div>
                );

            case "image":
            case "file":
                return (
                    <ImageInput
                        label={label}
                        name={name}
                        value={fieldValue}
                        onChange={handleChange}
                        error={fieldError}
                        required={required}
                        disabled={isDisabled}
                        accept={
                            fieldProps.accept ||
                            (type === "image"
                                ? "image/*"
                                : undefined)
                        }
                        preview={fieldProps.preview}
                        {...fieldProps}
                    />
                );

            default:
                return (
                    <Textinput
                        {...commonProps}
                        label={label}
                        type={type}
                        icon={icon}
                    />
                );
        }
    };

    return (
        <form
            className={`form ${formClassName} ${className}`.trim()}
            onSubmit={onSubmit}
            noValidate={noValidate}
            {...props}
        >

            {fields.length > 0 && (
                <div className="form-fields">

                    {fields.map((field) => {

                        if (!field?.name) {
                            return null;
                        }

                        return (
                            <div
                                key={
                                    field.id ||
                                    field.name
                                }
                                className={
                                    field.wrapperClassName || ""
                                }
                            >
                                {renderField(field)}
                            </div>
                        );
                    })}

                </div>
            )}

            {children}

            {actions.length > 0 && (
                <div className="form-actions">

                    {actions.map((action, index) => {

                        if (!action) {
                            return null;
                        }

                        const {
                            id,
                            label,
                            children: actionChildren,
                            component: ActionButton,
                            loading = false,
                            className: actionClassName = "",
                            ...actionProps
                        } = action;

                        const ButtonComponent = ActionButton || DefaultButton;

                        return (
                            <ButtonComponent
                                key={
                                    id ||
                                    `${label || "action"}-${index}`
                                }
                                {...actionProps}
                                disabled={
                                    disabled ||
                                    actionProps.disabled ||
                                    loading
                                }
                                className={
                                    `form-action ${actionClassName}`.trim()
                                }
                            >
                                {loading && (
                                    <span
                                        className="auth-button-spinner"
                                        aria-hidden="true"
                                    />
                                )}

                                {actionChildren || label}
                            </ButtonComponent>
                        );

                    })}

                </div>
            )}

        </form>
    );
}

export default Form;