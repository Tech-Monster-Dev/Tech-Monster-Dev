"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Defers non-critical UI work until an element approaches the viewport.
 *
 * @param {{ rootMargin?: string, enabled?: boolean }} options
 * @returns {{ ref: import("react").RefObject<HTMLElement | null>, isNearViewport: boolean }}
 */
export default function useNearViewport({
  rootMargin = "300px 0px",
  enabled = true,
} = {}) {
  const ref = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const element = ref.current;

    if (!element) return;

    // Graceful fallback for browsers without IntersectionObserver.
    if (typeof IntersectionObserver === "undefined") {
      setIsNearViewport(true);
      return;
    }

    let observer;

    try {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (entry?.isIntersecting) {
            setIsNearViewport(true);
            observer?.disconnect();
          }
        },
        { rootMargin, threshold: 0 }
      );

      observer.observe(element);
    } catch {
      // Never leave non-critical content permanently unavailable.
      setIsNearViewport(true);
    }

    return () => {
      observer?.disconnect();
    };
  }, [enabled, rootMargin]);

  return { ref, isNearViewport };
}
