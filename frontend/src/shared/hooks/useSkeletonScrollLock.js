import { useEffect } from "react";

let skeletonLockCount = 0;
let previousState = null;

const SCROLL_KEYS = new Set([
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "PageUp",
    "PageDown",
    "Home",
    "End",
    " ",
]);

function preventScroll(event) {
    event.preventDefault();
}

function preventKeyboardScroll(event) {
    if (SCROLL_KEYS.has(event.key)) {
        event.preventDefault();
    }
}

function lockScroll() {
    if (skeletonLockCount === 0) {
        previousState = {
            htmlOverflow: document.documentElement.style.overflow,
            bodyOverflow: document.body.style.overflow,
        };

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        document.addEventListener("wheel", preventScroll, {
            passive: false,
        });
        document.addEventListener("touchmove", preventScroll, {
            passive: false,
        });
        document.addEventListener("keydown", preventKeyboardScroll);
    }

    skeletonLockCount += 1;
}

function unlockScroll() {
    skeletonLockCount = Math.max(0, skeletonLockCount - 1);

    if (skeletonLockCount === 0) {
        document.documentElement.style.overflow =
            previousState?.htmlOverflow || "";

        document.body.style.overflow =
            previousState?.bodyOverflow || "";

        document.removeEventListener("wheel", preventScroll);
        document.removeEventListener("touchmove", preventScroll);
        document.removeEventListener("keydown", preventKeyboardScroll);

        previousState = null;
    }
}

export default function useSkeletonScrollLock(isLoading) {
    useEffect(() => {
        if (!isLoading) {
            return;
        }

        lockScroll();

        return () => {
            unlockScroll();
        };
    }, [isLoading]);
}
