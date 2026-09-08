import { useEffect } from "react";

const SCROLLBAR_VISIBLE_CLASS = "scrollbar-visible";
const HIDE_DELAY = 700;

export default function useScrollbarVisibility() {
    useEffect(() => {
        let hideTimeout;

        const handleScroll = () => {
            document.documentElement.classList.add(
                SCROLLBAR_VISIBLE_CLASS
            );

            window.clearTimeout(hideTimeout);

            hideTimeout = window.setTimeout(() => {
                document.documentElement.classList.remove(
                    SCROLLBAR_VISIBLE_CLASS
                );
            }, HIDE_DELAY);
        };

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        return () => {
            window.clearTimeout(hideTimeout);
            window.removeEventListener("scroll", handleScroll);
            document.documentElement.classList.remove(
                SCROLLBAR_VISIBLE_CLASS
            );
        };
    }, []);
}
