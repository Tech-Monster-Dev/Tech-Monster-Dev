import Warning from "../../../../components/ui/Warning";

function HelpClearWarning({
    open,
    onConfirm,
    onCancel
}) {
    return (
        <Warning
            open={open}
            title="Clear Support Chat"
            message="Are you sure you want to clear this support chat?"
            confirmText="Clear Chat"
            cancelText="Cancel"
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    );
}

export default HelpClearWarning;