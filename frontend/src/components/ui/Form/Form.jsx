import "./Form.css";

import Textinput from "./component/Textinput";
import TextArea from "./component/TextArea";
import Select from "./component/Select";
import PasswordInput from "./component/PasswordInput";
import OTPInput from "./component/OTPInput";
import ImageInput from "./component/ImageInput";

function Form({
    fields = [],
    sections = [],
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

        const { wrapperClassName: _wrapperClassName, ...safeFieldProps } = fieldProps;

        const commonProps = {
            name,
            value: fieldValue,
            onChange: handleChange,
            placeholder,
            error: fieldError,
            required,
            disabled: isDisabled,
            className: fieldClassName,
            ...safeFieldProps
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
                            safeFieldProps.accept ||
                            (type === "image"
                                ? "image/*"
                                : undefined)
                        }
                        preview={safeFieldProps.preview}
                        {...safeFieldProps}
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

    const renderFields = (fieldList, className = "") => (
        <div className={`form-fields ${className}`.trim()}>
            {fieldList.map((field) => {
                if (!field?.name) {
                    return null;
                }

                return (
                    <div
                        key={field.id || field.name}
                        className={field.wrapperClassName || ""}
                    >
                        {renderField(field)}
                    </div>
                );
            })}
        </div>
    );

    return (
        <form
            className={`form ${formClassName} ${className}`.trim()}
            onSubmit={onSubmit}
            noValidate={noValidate}
            {...props}
        >

            {fields.length > 0 && renderFields(fields)}

            {sections.map((section) => (
                <section
                    key={section.id || section.title}
                    className={section.className || "form-section"}
                >
                    {section.title && (
                        <h3
                            className={
                                section.titleClassName ||
                                "form-section-title"
                            }
                        >
                            {section.title}
                        </h3>
                    )}

                    {renderFields(
                        section.fields || [],
                        section.fieldsClassName
                    )}
                </section>
            ))}

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
                                loading={loading}
                                className={
                                    `form-action ${actionClassName}`.trim()
                                }
                            >
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