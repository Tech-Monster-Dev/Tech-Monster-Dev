export default function DeleteModal({
    open,
    onCancel,
    onConfirm
}) {

    if (!open) return null;

    return (

        <div className="modal-bg">
            <div className="delete-modal">
                <h2>
                    Delete Internship?
                </h2>

                <p>
                    This action cannot be undone.
                </p>

                <div>
                    <button
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}