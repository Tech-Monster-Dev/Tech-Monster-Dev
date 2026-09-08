import { useEffect } from "react";

export default function useModalScrollLock(isOpen) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const htmlElement = document.documentElement;
        const bodyElement = document.body;

        const previousHtmlOverflow = htmlElement.style.overflow;
        const previousBodyOverflow = bodyElement.style.overflow;

        htmlElement.style.overflow = "hidden";
        bodyElement.style.overflow = "hidden";

        return () => {
            htmlElement.style.overflow = previousHtmlOverflow;
            bodyElement.style.overflow = previousBodyOverflow;
        };
    }, [isOpen]);
}
