const DIRECTIONS = ["n", "e", "s", "w", "ne", "nw", "se", "sw"];

export default function ResizeHandles({ onResizeStart }) {
    return (
        <>
            {DIRECTIONS.map((direction) => (
                <span
                    key={direction}
                    className={`lesson-terminal__resize lesson-terminal__resize--${direction}`}
                    onPointerDown={(event) =>
                        onResizeStart(event, direction)
                    }
                    aria-hidden="true"
                />
            ))}
        </>
    );
}
