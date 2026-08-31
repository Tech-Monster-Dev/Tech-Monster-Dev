import { useRef } from "react";

const GAP = 16;
const MIN_WIDTH = 420;
const MIN_HEIGHT = 300;

export default function useTerminalResize(
    terminalRef,
    setTerminalSize
) {
    const resizeRef = useRef(null);

    const start = (event, direction) => {
        if (event.button !== 0) return;

        const terminal = terminalRef.current;

        if (!terminal) return;

        const rect = terminal.getBoundingClientRect();

        resizeRef.current = {
            pointerId: event.pointerId,
            direction,
            startX: event.clientX,
            startY: event.clientY,
            startLeft: rect.left,
            startTop: rect.top,
            startWidth: rect.width,
            startHeight: rect.height,
        };

        terminal.style.transform = "none";
        terminal.setPointerCapture?.(event.pointerId);

        document.body.classList.add(
            "lesson-terminal--resizing"
        );

        event.preventDefault();
        event.stopPropagation();
    };

    const move = (event) => {
        const resize = resizeRef.current;

        if (
            !resize ||
            event.pointerId !== resize.pointerId
        ) {
            return;
        }

        const dx = event.clientX - resize.startX;
        const dy = event.clientY - resize.startY;

        let left = resize.startLeft;
        let top = resize.startTop;
        let width = resize.startWidth;
        let height = resize.startHeight;

        if (resize.direction.includes("e")) {
            width = resize.startWidth + dx;
        }

        if (resize.direction.includes("s")) {
            height = resize.startHeight + dy;
        }

        if (resize.direction.includes("w")) {
            width = resize.startWidth - dx;
            left = resize.startLeft + dx;
        }

        if (resize.direction.includes("n")) {
            height = resize.startHeight - dy;
            top = resize.startTop + dy;
        }

        if (width < MIN_WIDTH) {
            width = MIN_WIDTH;

            if (resize.direction.includes("w")) {
                left =
                    resize.startLeft +
                    resize.startWidth -
                    MIN_WIDTH;
            }
        }

        if (height < MIN_HEIGHT) {
            height = MIN_HEIGHT;

            if (resize.direction.includes("n")) {
                top =
                    resize.startTop +
                    resize.startHeight -
                    MIN_HEIGHT;
            }
        }

        const maxWidth = Math.max(
            MIN_WIDTH,
            window.innerWidth - left - GAP
        );

        const maxHeight = Math.max(
            MIN_HEIGHT,
            window.innerHeight - top - GAP
        );

        width = Math.min(width, maxWidth);
        height = Math.min(height, maxHeight);

        left = Math.max(
            GAP,
            Math.min(
                left,
                window.innerWidth - width - GAP
            )
        );

        top = Math.max(
            GAP,
            Math.min(
                top,
                window.innerHeight - height - GAP
            )
        );

        setTerminalSize({
            width,
            height,
        });

        if (terminalRef.current) {
            terminalRef.current.style.left = `${left}px`;
            terminalRef.current.style.top = `${top}px`;
        }
    };

    const end = (event) => {
        const resize = resizeRef.current;

        if (
            !resize ||
            event.pointerId !== resize.pointerId
        ) {
            return;
        }

        resizeRef.current = null;

        terminalRef.current?.releasePointerCapture?.(
            event.pointerId
        );

        document.body.classList.remove(
            "lesson-terminal--resizing"
        );
    };

    return {
        start,
        move,
        end,
    };
}
