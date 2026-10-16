import { useEffect } from "react";

export default function useFeedbackAutoScroll(ref, itemCount) {
    useEffect(() => {
        const container = ref.current;
        const track = container?.querySelector(".feedback-track");
        const firstGroup = track?.querySelector(".feedback-track-group");

        if (container == null || track == null || firstGroup == null || itemCount < 2) {
            return undefined;
        }

        let position = 0;
        let paused = false;

        const getLoopWidth = () => {
            const gap = parseFloat(getComputedStyle(track).gap) || 0;
            return firstGroup.getBoundingClientRect().width + gap;
        };

        const step = () => {
            if (paused) {
                return;
            }

            position += 1;
            const loopWidth = getLoopWidth();

            if (loopWidth > 0 && position >= loopWidth) {
                position -= loopWidth;
            }

            track.style.transform = `translate3d(${-position}px, 0, 0)`;
        };

        const pause = () => { paused = true; };
        const resume = () => { paused = false; };

        container.addEventListener("mouseenter", pause);
        container.addEventListener("mouseleave", resume);
        container.addEventListener("touchstart", pause, { passive: true });
        container.addEventListener("touchend", resume, { passive: true });

        const timer = setInterval(step, 20);

        return () => {
            clearInterval(timer);
            track.style.transform = "";
            container.removeEventListener("mouseenter", pause);
            container.removeEventListener("mouseleave", resume);
            container.removeEventListener("touchstart", pause);
            container.removeEventListener("touchend", resume);
        };
    }, [ref, itemCount]);
}
