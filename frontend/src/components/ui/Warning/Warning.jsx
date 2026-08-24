import './Warning.css';

export default function Warning({
    open,
    title = "Warning",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel
}) {

    if (!open) {
        return null;
    }

    return (
        <div
            className="warning-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="warning-title"
        >
            <div className="warning-modal">

                <div className="warning-icon" aria-hidden="true">
                    !
                </div>

                <h2 id="warning-title">
                    {title}
                </h2>

                <p>
                    {message}
                </p>

                <div className="warning-actions">

                    <button
                        type="button"
                        className="warning-cancel-btn"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className="warning-confirm-btn"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>

                </div>

            </div>
        </div>
    );
}
