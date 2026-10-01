import { useEffect } from "react";

export const usePointerLight = () => {
  useEffect(() => {
    if (!globalThis.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const handlePointerMove = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-glass-light]") : null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--light-x", `${event.clientX - rect.left}px`);
      target.style.setProperty("--light-y", `${event.clientY - rect.top}px`);
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => document.removeEventListener("pointermove", handlePointerMove);
  }, []);
};
