import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import "./Tooltip.css";

function Tooltip({ label, children, disabled = false }) {
    const [position, setPosition] = useState(null);
    const triggerRef = useRef(null);

    const handleMouseEnter = () => {
        if (disabled || !triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();

        setPosition({
            left: rect.right,
            top: rect.top + rect.height / 2,
        });
    };

    const handleMouseLeave = () => {
        setPosition(null);
    };

    if (disabled) {
        return children;
    }

    return (
        <span
            ref={triggerRef}
            className="tooltip-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {position &&
                createPortal(
                    <span
                        className="tooltip-content"
                        style={{
                            left: `${position.left}px`,
                            top: `${position.top}px`,
                        }}
                    >
                        {label}
                    </span>,
                    document.body
                )}
        </span>
    );
}

export default Tooltip;
