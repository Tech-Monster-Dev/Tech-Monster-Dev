import "./ImageInput.css";

import { useEffect, useRef, useState } from "react";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";

function ImageInput({
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    accept = "image/*",
    preview = true,
    multiple = false,
    maxSize,
    className = "",
    placeholder = "Choose an image",
    previewClassName = "",
    ...props
}) {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState("");

    /*
     * Create preview from File / FileList / URL
     */
    useEffect(() => {
        if (!value) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreviewUrl("");
            return;
        }

        if (value instanceof File) {
            const url = URL.createObjectURL(value);

            setPreviewUrl(url);

            return () => {
                URL.revokeObjectURL(url);
            };
        }

        if (typeof value === "string") {
            setPreviewUrl(value);
            return;
        }

        if (value instanceof FileList && value.length > 0) {
            const file = value[0];

            if (file instanceof File) {
                const url = URL.createObjectURL(file);

                setPreviewUrl(url);

                return () => {
                    URL.revokeObjectURL(url);
                };
            }
        }

        setPreviewUrl("");
    }, [value]);

    const handleChange = (event) => {
        const files = event.target.files;

        if (!files || files.length === 0) {
            return;
        }

        /*
         * Optional file size validation
         * maxSize should be provided in bytes
         */
        if (maxSize) {
            const hasLargeFile = Array.from(files).some(
                (file) => file.size > maxSize
            );

            if (hasLargeFile) {
                if (onChange) {
                    onChange({
                        target: {
                            name,
                            value: multiple ? files : files[0],
                            files,
                            error: "File size is too large"
                        }
                    });
                }

                return;
            }
        }

        if (onChange) {
            onChange({
                target: {
                    name,
                    value: multiple ? files : files[0],
                    files
                }
            });
        }
    };

    const handleRemove = () => {
        if (disabled) return;

        setPreviewUrl("");

        if (inputRef.current) {
            inputRef.current.value = "";
        }

        if (onChange) {
            onChange({
                target: {
                    name,
                    value: multiple ? [] : null,
                    files: null
                }
            });
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();

        if (disabled) return;

        const files = event.dataTransfer.files;

        if (!files || files.length === 0) {
            return;
        }

        const selectedFiles = multiple
            ? files
            : files[0];

        if (onChange) {
            onChange({
                target: {
                    name,
                    value: selectedFiles,
                    files
                }
            });
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const openFilePicker = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    return (
        <div className={`image-input-group ${className}`.trim()}>

            {label && (
                <label className="image-input-label">
                    {label}

                    {required && (
                        <span className="image-input-required">
                            *
                        </span>
                    )}
                </label>
            )}

            <div
                className={`image-input ${error ? "image-input-error" : ""} ${
                    disabled ? "image-input-disabled" : ""
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >

                <input
                    ref={inputRef}
                    id={name}
                    name={name}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled}
                    onChange={handleChange}
                    className="image-input-native"
                    {...props}
                />

                {preview && previewUrl ? (

                    <div
                        className={`image-preview ${previewClassName}`.trim()}
                    >

                        <img
                            src={previewUrl}
                            alt="Selected preview"
                            className="image-preview-image"
                        />

                        {!disabled && (
                            <button
                                type="button"
                                className="image-preview-remove"
                                onClick={handleRemove}
                                aria-label="Remove selected image"
                            >
                                <FaTimes />
                            </button>
                        )}

                    </div>

                ) : (

                    <button
                        type="button"
                        className="image-input-trigger"
                        onClick={openFilePicker}
                        disabled={disabled}
                    >
                        <FaCloudUploadAlt className="image-upload-icon" />

                        <span className="image-upload-title">
                            {placeholder}
                        </span>

                        <span className="image-upload-text">
                            Click to upload or drag and drop
                        </span>
                    </button>

                )}

            </div>

            {error && (
                <small className="image-input-error-message">
                    {error}
                </small>
            )}

        </div>
    );
}

export default ImageInput;