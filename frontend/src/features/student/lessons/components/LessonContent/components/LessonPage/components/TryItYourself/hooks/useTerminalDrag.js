import { useRef } from "react";

const GAP = 16;

export default function useTerminalDrag(terminalRef) {
    const dragRef = useRef(null);

    const start = (event) => {
        if (event.button !== 0) return;

        if (
            event.target.closest(
                "button, input, textarea, select, a"
            )
        ) {
            return;
        }

        const terminal = terminalRef.current;

        if (!terminal) return;

        const rect = terminal.getBoundingClientRect();

        /*
         * Convert the terminal from centered positioning
         * to its exact current viewport position.
         */
        terminal.style.transform = "none";
        terminal.style.left = `${rect.left}px`;
        terminal.style.top = `${rect.top}px`;

        /*
         * Store exactly where inside the terminal
         * the student grabbed it.
         */
        dragRef.current = {
            pointerId: event.pointerId,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
        };

        terminal.setPointerCapture?.(event.pointerId);

        document.body.classList.add(
            "lesson-terminal--dragging"
        );

        event.preventDefault();
    };

    const move = (event) => {
        const drag = dragRef.current;

        if (
            !drag ||
            event.pointerId !== drag.pointerId
        ) {
            return;
        }

        const terminal = terminalRef.current;

        if (!terminal) return;

        const rect = terminal.getBoundingClientRect();

        const maxLeft = Math.max(
            GAP,
            window.innerWidth - rect.width - GAP
        );

        const maxTop = Math.max(
            GAP,
            window.innerHeight - rect.height - GAP
        );

        const left = Math.min(
            Math.max(
                GAP,
                event.clientX - drag.offsetX
            ),
            maxLeft
        );

        const top = Math.min(
            Math.max(
                GAP,
                event.clientY - drag.offsetY
            ),
            maxTop
        );

        terminal.style.left = `${left}px`;
        terminal.style.top = `${top}px`;
    };

    const end = (event) => {
        const drag = dragRef.current;

        if (
            !drag ||
            event.pointerId !== drag.pointerId
        ) {
            return;
        }

        dragRef.current = null;

        terminalRef.current?.releasePointerCapture?.(
            event.pointerId
        );

        document.body.classList.remove(
            "lesson-terminal--dragging"
        );
    };

    return {
        start,
        move,
        end,
    };
}
