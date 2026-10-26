"use client";

import { useEffect } from "react";

export default function ImageProtection() {
  useEffect(() => {
    const handleContextMenu = (event) => {
      if (event.target instanceof Element && event.target.closest("img")) {
        event.preventDefault();
      }
    };

    const handleDragStart = (event) => {
      if (event.target instanceof Element && event.target.closest("img")) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  return null;
}
